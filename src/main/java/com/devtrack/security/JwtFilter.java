package com.devtrack.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();
        // 1. AUTHENTICATION ENDPOINTS
     
        if (path.equals("/api/auth/register") || path.equals("/api/auth/login")) {
            return true;
        }

        // 2. SWAGGER UI

        if (path.equals("/swagger-ui.html") || path.startsWith("/swagger-ui/")) {
            return true;
        }

        // 3. OPENAPI DOCUMENTATION

        if (path.equals("/v3/api-docs") || path.startsWith("/v3/api-docs/")) {
            return true;
        }
        
        // 4. CORS PREFLIGHT REQUEST

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        return false;
    }
    // JWT FILTER
   
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,FilterChain filterChain)throws ServletException, IOException {

        String requestPath = request.getServletPath();

        System.out.println();
        System.out.println("========================================");
        System.out.println("JWT FILTER");
        System.out.println("Request : "+ request.getMethod() + " " + requestPath);

        // GET AUTHORIZATION HEADER
      
        String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String token = null;

        // STEP 1: CHECK AUTHORIZATION HEADER
      
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            System.out.println("Authorization header: NOT FOUND");
        } else {

            System.out.println("Authorization header: FOUND");
            
            // STEP 2: CHECK BEARER TOKEN
        
            if (authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7).trim();

                if (token.isBlank()) {
                    System.out.println("Bearer token: EMPTY");
                } else {

                    System.out.println("Bearer token: FOUND");

                    // STEP 3: EXTRACT USERNAME / EMAIL FROM JWT
                    try {
                        username =jwtUtil.extractUsername(token);

                        System.out.println("JWT username/email: "+ username);
                    } catch (Exception e) {

                        System.out.println("ERROR: Could not extract username from JWT");

                        System.out.println("JWT will NOT be authenticated.");
                    }
                }

            } else {
                System.out.println("ERROR: Authorization header does not start with Bearer");
            }
        }
        // STEP 4: CHECK USERNAME
        if (username != null && !username.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // STEP 5: LOAD USER FROM DATABASE
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                System.out.println("User found in database: "+ userDetails.getUsername());

                System.out.println("User authorities: "+ userDetails.getAuthorities());
                // STEP 6: VALIDATE JWT
              
                boolean validToken = jwtUtil.validateToken(token);

                System.out.println("JWT validation result: "+ validToken);

                // STEP 7: CREATE AUTHENTICATION
               
                if (validToken) {

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    // STEP 8: ADD REQUEST DETAILS
                    authentication.setDetails(new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );
                    // STEP 9: SET SECURITY CONTEXT
                
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("AUTHENTICATION SUCCESSFULLY SET");

                } else {

                    System.out.println("JWT INVALID - Authentication NOT set");
                }

            } catch (Exception e) {

                System.out.println("ERROR while authenticating JWT");

                System.out.println("Authentication NOT set.");
            }

        } else if (username == null || username.isBlank()) {

            System.out.println("Username is NULL/EMPTY - Authentication NOT set");

        } else {
            System.out.println("Authentication already exists");
        }
        // STEP 10: CONTINUE REQUEST

        filterChain.doFilter(request,response);

        System.out.println("JWT FILTER COMPLETED");
        System.out.println("========================================");
        System.out.println();
    }
}