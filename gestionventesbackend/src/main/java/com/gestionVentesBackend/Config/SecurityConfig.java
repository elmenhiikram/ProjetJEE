package com.gestionVentesBackend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
<<<<<<< HEAD
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
=======
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

<<<<<<< HEAD
    private final SimpleTokenAuthFilter simpleTokenAuthFilter;

    public SecurityConfig(SimpleTokenAuthFilter simpleTokenAuthFilter) {
        this.simpleTokenAuthFilter = simpleTokenAuthFilter;
    }

=======
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
<<<<<<< HEAD
                // Endpoints publics
                .requestMatchers("/api/auth/**").permitAll()

                // ETL: réservé à l'analyste
                .requestMatchers("/api/etl/**").hasRole("ANALYST")

                // Pas de CRUD produit/vente manuel via API pour l'analyste
                .requestMatchers(HttpMethod.POST, "/produits/**", "/ventes/**").hasAnyRole("ADMIN", "VENDEUR")
                .requestMatchers(HttpMethod.PUT, "/produits/**", "/ventes/**").hasAnyRole("ADMIN", "VENDEUR")
                .requestMatchers(HttpMethod.DELETE, "/produits/**", "/ventes/**").hasAnyRole("ADMIN", "VENDEUR")

                // Le reste reste accessible (mode dev)
                .anyRequest().permitAll()
                );

        http.addFilterBefore(simpleTokenAuthFilter, UsernamePasswordAuthenticationFilter.class);

=======
                        // ✅ TOUT est accessible SANS authentification (MODE DÉVELOPPEMENT)
                        .anyRequest().permitAll()
                );

>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4200",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}