package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

/**
 * Configures several aspects of the application.
 */
@Configuration
public class Config {

    /**
     * Returns a Customizer which redirects every not found page to the root page.
     * <p>
     * This is important to enable the user to navigate the app with the URLs. Therefore, the
     * developer does NOT have to add all non-api-paths to a controller. Internally all
     * 404-not-found calls are redirected to the index.html page.
     * 
     * @return {@link WebServerFactoryCustomizer} which enables routing in the SPA
     */
    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> singlePageAppRouting() {
        return new WebServerFactoryCustomizer<ConfigurableServletWebServerFactory>() {

            @Override
            public void customize(ConfigurableServletWebServerFactory factory) {
                factory.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/"));
            }
        };
    }
}
