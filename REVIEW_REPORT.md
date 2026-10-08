# DevTrack Detailed Code Review Fix Report

Written in developer-friendly language with examples, reasoning and verification steps.

Project: DevTrack
Primary stack: React 19 / Vite / Axios + Spring Boot / Spring Security / JWT / JPA-Hibernate / MySQL

Review style: Detailed explanation first, then evidence → impact → fix → verification

## Executive Summary
The previous report was intentionally written like a formal audit. This version explains the actual work completed in the codebase in the same developer-friendly format: what the code was doing, why that behavior was wrong, what risk it created, and exactly what was changed to fix it.

The project has a good layered architecture, but the main issue was not infrastructure — it was authorization. Several API flows were trusting the client-provided userId instead of the authenticated user identity. Another critical issue was password persistence: one code path was securely hashing passwords, while another was still assigning raw values to the entity.

The fixes implemented here resolve the P0 issues before adding more product features. The backend is now enforcing resource ownership consistently instead of assuming that the client is telling the truth.

## Overall Assessment
Area | Assessment | Comment
Architecture | Good | Controller/service/repository layering is clear and structured.
Authentication | Reasonable | JWT is present and work is being enforced around it.
Authorization | Fixed | Ownership checks are now enforced server-side.
Credential handling | Fixed | Passwords are hashed before persistence.
Testing | Improved | Regression checks were added for critical paths.
Frontend quality | Still needs cleanup | UI code still has some cleanup work, but the security issues were fixed at source.
Production readiness | Improved | The application is much closer to safe production behavior for the reviewed issues.

## Detailed Findings — Explained for Developers

### F-01. The API No Longer Trusts userId Instead of the Logged-In User
Severity: P0 — CRITICAL

Why this matters
This was the single most important issue in the project. Authentication answers "Who are you?" Authorization answers "What are you allowed to access?" The application was performing the first step reasonably well, but not consistently enforcing the second.

Risk
A user with a valid JWT could tamper with a URL such as /api/users/10/projects and change it to /api/users/20/projects. If the backend only checked that the JWT was valid and then trusted the path variable, one user could access another user's data.

Estimated effort
High — required service-layer and ownership validation refactoring.

What I changed
I introduced a shared authenticated-user guard in [src/main/java/com/devtrack/security/CurrentUserService.java](src/main/java/com/devtrack/security/CurrentUserService.java).

That service reads the authenticated user from Spring Security's SecurityContext and enforces identity matching before allowing access to user-owned resources. Then I applied it to the relevant service implementations:

- [src/main/java/com/devtrack/service/impl/ProjectServiceImpl.java](src/main/java/com/devtrack/service/impl/ProjectServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/SkillServiceImpl.java](src/main/java/com/devtrack/service/impl/SkillServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/NoteServiceImpl.java](src/main/java/com/devtrack/service/impl/NoteServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java](src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/DashboardServiceImpl.java](src/main/java/com/devtrack/service/impl/DashboardServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/UserServiceImpl.java](src/main/java/com/devtrack/service/impl/UserServiceImpl.java)

Why this is a problem
The bug existed because the application treated path parameters as trusted authorization input. In other words, it asked, "Does this userId exist in the database?" but not, "Does this userId belong to the currently authenticated user?"

The secure model is:
- JWT proves who the caller is
- security context identifies the user
- resource ownership must be checked against that user
- the backend must reject mismatches

How to fix it
The fix is to enforce ownership at the service layer. The server now validates:
- caller identity from JWT
- requested resource ownership against that identity
- mismatch → reject with AccessDeniedException

This is the correct fix because the backend is the trust boundary. The React frontend can never be treated as the security control.

How to verify the fix
- Create two users in a test environment
- Log in as User A
- Attempt to fetch and mutate User B's project, skill, note, log, or dashboard data
- Requests must fail with authorization errors or return a non-readable result
- Confirm that User A can still access only their own resources

Developer comment
Treat the authenticated user as the only valid owner source in server-side logic. The URL parameter is not an ownership token; it is only user input.

Current secure idea:
JWT → SecurityContext → currentUserId → repository query using user ownership

### F-02. DailyLog Creation and Update No Longer Accept Another User's Skill
Severity: P0 — CRITICAL

Why this matters
This is a more specific version of the ownership problem, but it affects data integrity directly. A user may know or guess another user's skill ID and attach it to a log or update an existing log to use that foreign skill.

Risk
User A might create a DailyLog tied to User B's skill. That creates a record in User A's data set but links to a resource owned by User B. That is a cross-user data integrity problem and an authorization flaw even if the user cannot browse the other user's full skill list.

Estimated effort
Low-to-medium.

What I changed
In [src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java](src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java), I changed the logic so that any skillId used in a DailyLog is validated against the authenticated user's ownership.

Before the fix, the code did something like:
- find skill by ID
- accept it if it exists

After the fix, the code now does:
- resolve the current authenticated user
- verify that the skill belongs to that user
- reject the request if the skill is not owned by the current user

Why this is a problem
The issue was not just that the skill existed; it was that the system did not ask whether the skill belonged to the authenticated user. That is a critical missing authorization check.

How to fix it
The fix is to enforce ownership on foreign keys. For DailyLog operations, the rule is:
- if a skill is supplied, it must belong to the same user who owns the DailyLog

This prevents cross-user linkage and protects data integrity.

How to verify the fix
- Create Skill A for User A
- Log in as User B
- Attempt to create or update a DailyLog using Skill A's ID
- The request must fail
- Add a regression test to protect this behavior from future regressions

Developer comment
When accepting a foreign key from the client, never ask only, "Does this ID exist?" Also ask, "Does this ID belong to the authenticated user?"

### F-03. Milestone Access Now Follows the Project Ownership Chain
Severity: P0 — CRITICAL

Why this matters
Milestones live under projects. That means the authorization check must follow the resource chain: user → owns project → project owns milestone.

Risk
If Project 50 belongs to User A and User B knows the project ID, then User B might list, create, update, or delete milestones under that project if the code checks only whether the project exists.

Estimated effort
Medium.

What I changed
I hardened [src/main/java/com/devtrack/service/impl/MilestoneServiceImpl.java](src/main/java/com/devtrack/service/impl/MilestoneServiceImpl.java) by validating ownership at each step:

- create milestone: project must belong to the current user
- list milestones: project must belong to the current user
- update milestone: milestone must belong to a project owned by the current user
- delete milestone: milestone must belong to a project owned by the current user

I added helper methods to centralize the logic and prevent accidental bypasses.

Why this is a problem
Previously, the service was resolving project IDs and milestone IDs without confirming that the authenticated user actually owned the parent project. This breaks the ownership chain and allows cross-user access.

How to fix it
The correct rule is:
- a user can only manipulate milestones under a project they own
- a milestone is not valid unless its parent project is owned by the same authenticated user

How to verify the fix
- User B tries to view User A's milestones
- User B tries to create a milestone for User A's project
- User B tries to update a milestone in User A's project
- User B tries to delete a milestone in User A's project
- All four actions must fail consistently

Developer comment
Think of the rule as: authenticated user → owns project → project owns milestone. Every link in that chain must be true.

### F-04. Password Handling Is Now Consistent and Secure
Severity: P0 — CRITICAL

Why this matters
Passwords are one-way secrets. The platform should never persist the original password value, even temporarily in the repository layer.

Risk
One path was hashing passwords correctly, while another path could still assign the raw password to the entity. That creates a security gap where plain-text secrets could end up in storage, or future developers could reintroduce insecure handling.

Estimated effort
Low.

What I changed
I updated [src/main/java/com/devtrack/service/impl/UserServiceImpl.java](src/main/java/com/devtrack/service/impl/UserServiceImpl.java) so that both save and update operations now use Spring's PasswordEncoder.

This means:
- registration hashes the user's password before saving
- updating a password also hashes the new value before persistence
- the raw password is no longer kept in the user model as stored data

Why this is a problem
The previous code path was inconsistent. A raw password assignment to the entity could leak sensitive information if the database is accessed or compromised.

How to fix it
The correct fix is to always encode with BCrypt before saving a user. This is now enforced in service logic for all user creation and password updates.

How to verify the fix
- Register a user with a known password
- Inspect the stored value in the database or the object passed to save
- Ensure it is not equal to the plaintext value
- Confirm a BCrypt hash is used and it matches the original password with PasswordEncoder.matches

Developer comment
Password hashing is not optional. It is a basic security requirement, and the project must enforce it uniformly.

## Files Updated

- [src/main/java/com/devtrack/security/CurrentUserService.java](src/main/java/com/devtrack/security/CurrentUserService.java)
- [src/main/java/com/devtrack/service/impl/UserServiceImpl.java](src/main/java/com/devtrack/service/impl/UserServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/ProjectServiceImpl.java](src/main/java/com/devtrack/service/impl/ProjectServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/SkillServiceImpl.java](src/main/java/com/devtrack/service/impl/SkillServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/NoteServiceImpl.java](src/main/java/com/devtrack/service/impl/NoteServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java](src/main/java/com/devtrack/service/impl/DailyLogServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/MilestoneServiceImpl.java](src/main/java/com/devtrack/service/impl/MilestoneServiceImpl.java)
- [src/main/java/com/devtrack/service/impl/DashboardServiceImpl.java](src/main/java/com/devtrack/service/impl/DashboardServiceImpl.java)
- [src/test/java/com/devtrack/security/UserSecurityFixTest.java](src/test/java/com/devtrack/security/UserSecurityFixTest.java)

## Verification and Evidence
I ran the backend test suite after the fixes:

- .\mvnw test -q

Result: passed successfully.

The regression tests added cover:
- password hashing before persistence
- denying cross-user modification attempts
- ensuring the backend is enforcing ownership instead of trusting client input

## Final Assessment
The critical security problems identified in the review were fixed in the backend. The major issue was not a missing feature — it was a missing authorization rule. The application was trusting the client too much and storing passwords inconsistently.

The code now enforces the correct rule:
"An authenticated user may access only resources that belong to that authenticated user."

This is the required foundation before future product features or UI work should be expanded.
