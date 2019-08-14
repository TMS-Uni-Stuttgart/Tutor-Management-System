package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;

/**
 * SecurityConfig
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(authProvider());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        /* @formatter:off */
        http.logout().logoutUrl("/api/logout").invalidateHttpSession(true).deleteCookies("JSESSIONID")
            .and()
            .csrf().disable().cors()
            .and()
            .authenticationProvider(authProvider()).authorizeRequests()
            .antMatchers("/")
                .permitAll()
            .antMatchers("/api/login/**")
                .permitAll()
            
            .antMatchers("/api/user/{userid}/**")
                .access("@webSecurity.hasReadWriteAccessToUser(authentication,#userid)")
            .antMatchers(HttpMethod.GET, "/api/user/**")
                .hasAnyAuthority(Role.ADMIN.toString(), Role.EMPLOYEE.toString())
            .antMatchers("/api/user/**")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers(HttpMethod.GET, "/api/tutorial/{tutorialid}/**")
                .access("@webSecurity.hasReadAccessToTutorial(authentication,#tutorialid)")
            .antMatchers("/api/tutorial/{tutorialid}/team/{teamid}/points/**")
                .access("@webSecurity.hasReadWriteAccessToPointsOfTutorial(authentication,#tutorialid)")
            .antMatchers("/api/tutorial/{tutorialid}/team/**", "/api/tutorial/{tutorialid}/student/**")
                .access("@webSecurity.hasReadWriteAccessToTutorialContent(authentication,#tutorialid)")
            .antMatchers(HttpMethod.GET, "/api/tutorial/**")
                .authenticated()
            .antMatchers("/api/tutorial/**")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers("/api/student/{studentid}/points/**")
                .access("@webSecurity.hasReadWriteAccessToPointsOfStudent(authentication,#studentid)")
            .antMatchers(HttpMethod.GET, "/api/student/{studentid}/**")
                .access("@webSecurity.hasReadAccessToStudent(authentication,#studentid)")
            .antMatchers("/api/student/{studentid}/**")
                .access("@webSecurity.hasReadWriteAccessToStudent(authentication,#studentid)")
            .antMatchers(HttpMethod.POST, "/api/student")
                .access("@webSecurity.canCreateStudents(authentication)")
            .antMatchers(HttpMethod.GET, "/api/student")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers(HttpMethod.GET, "/api/scheinexam/**")
                .authenticated()
            .antMatchers("/api/scheinexam/**")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers(HttpMethod.GET, "/api/scheincriteria/**")
                .hasAnyAuthority(Role.ADMIN.toString(), Role.EMPLOYEE.toString())
            .antMatchers("/api/scheincriteria/**")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers(HttpMethod.GET, "/api/sheet")
                .authenticated()
            .antMatchers("/api/sheet")
                .hasAnyAuthority(Role.ADMIN.toString())

            .antMatchers("/api/**")
                .hasAnyAuthority(Role.ADMIN.toString())
            .and()
            .httpBasic()
            .and()
            .sessionManagement().sessionFixation().migrateSession().maximumSessions(1);
        /* @formatter:on */
    }

    @Bean
    protected CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.applyPermitDefaultValues();
        config.addAllowedOrigin("http://localhost:3000");

        config.addAllowedMethod(HttpMethod.DELETE);
        config.addAllowedMethod(HttpMethod.PATCH);

        config.setAllowCredentials(true);

        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    protected HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
