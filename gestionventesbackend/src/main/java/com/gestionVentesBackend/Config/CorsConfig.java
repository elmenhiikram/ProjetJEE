package com.gestionVentesBackend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:5173",
<<<<<<< HEAD
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://localhost:4200",
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:5173",
=======
                        "http://localhost:3000",
                        "http://localhost:4200",
                        "http://127.0.0.1:5173",
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
                        "http://127.0.0.1:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}