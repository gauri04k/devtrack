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

        return path.equals("/api/auth/register") || path.equals("/api/auth/login");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getServletPath();

        System.out.println("----------------------------------------");
        System.out.println("JWT FILTER");
        System.out.println("Request: " + request.getMethod() + " " + requestPath);

        String authorizationHeader =
                request.getHeader("Authorization");

        String username = null;
        String token = null;

        /*
         * STEP 1:
         * Check Authorization header
         */
        if (authorizationHeader == null) {
            System.out.println("Authorization header: NOT FOUND");
        } else {

            System.out.println("Authorization header: FOUND");
            if (authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
                
                System.out.println("Bearer token: FOUND");

                try {

                    /*
                     * STEP 2:
                     * Extract email/username from JWT
                     */
                    username = jwtUtil.extractUsername(token);

                    System.out.println("JWT username/email: " + username);

                } catch (Exception e) {
                    System.out.println("ERROR: Could not extract username from JWT");
                                     e.printStackTrace();
                }

            } else {
                System.out.println("ERROR: Authorization header does not start with Bearer");
            }
        }

        /*
         * STEP 3:
         * If username exists and user is not already authenticated
         */
        if (username != null
                && SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

            try {

                /*
                 * STEP 4:
                 * Load user from database
                 */
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                System.out.println("User found in database: "+ userDetails.getUsername());

                System.out.println("User authorities: "+ userDetails.getAuthorities());

                /*
                 * STEP 5:
                 * Validate JWT
                 */
                boolean validToken = jwtUtil.validateToken(token);

                System.out.println("JWT validation result: "+ validToken);

                if (validToken) {
                	
                    /*
                     * STEP 6:
                     * Create Spring Security authentication
                     */
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    /*
                     * STEP 7:
                     * Add request details
                     */
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    /*
                     * STEP 8:
                     * Put authentication into SecurityContext
                     */
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println("AUTHENTICATION SUCCESSFULLY SET");
                } else {

                    System.out.println("JWT INVALID - Authentication NOT set");
                }

            } catch (Exception e) {
                System.out.println("ERROR while authenticating JWT");
                e.printStackTrace();
            }

        } else if (username == null) {
            System.out.println("Username is NULL - Authentication NOT set");

        } else {
            System.out.println("Authentication already exists");
        }

        /*
         * STEP 9:
         * Continue request
         */
        filterChain.doFilter(request, response);

        System.out.println("JWT FILTER COMPLETED");
        System.out.println("----------------------------------------");
    }
}