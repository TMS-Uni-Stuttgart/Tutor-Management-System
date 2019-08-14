package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.EnvironmentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.UserService;

/**
 * DemoData
 */
@Component
@Transactional
public class AppRunner implements ApplicationRunner {

    private final Logger logger = LoggerFactory.getLogger(AppRunner.class);

    @Autowired
    private UserService userService;

    @Autowired
    private EnvironmentService environmentService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        checkEnvironmentVariables();

        createAdminIfNoUsersArePresent();
    }

    private void checkEnvironmentVariables() {
        final List<String> missingEnvVariables =
                environmentService.checkAvailabilityOfAllRequiredVariables();

        if (!missingEnvVariables.isEmpty()) {
            final StringBuilder missing = new StringBuilder(
                    "The following environment variables are required but not set: ");

            for (int i = 0; i < missingEnvVariables.size(); i++) {
                missing.append(missingEnvVariables.get(i));

                if (i != missingEnvVariables.size() - 1) {
                    missing.append(", ");
                }
            }

            missing.append(
                    ". Please make sure these environment variables are set properly. Server will shut down, now.");

            logger.error(missing.toString());
            System.exit(1);
        }
    }

    private void createAdminIfNoUsersArePresent()
            throws IllegalStateException, ElementNotFoundException {
        final List<User> users = userService.getAllUsers();

        if (users.isEmpty()) {
            logger.info("Creating new administrator because the DB does not contain any users.");

            userService.createUser(new CreateUserDTO("admin", "admin", new ArrayList<>(),
                    Arrays.asList(Role.ADMIN), "admin", environmentService
                            .getProperty(EnvironmentVariable.TMS_SERVER_INITIAL_ADMIN_PASSWORD)));
        }
    }
}
