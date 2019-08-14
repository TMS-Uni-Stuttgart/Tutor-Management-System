package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import java.util.ArrayList;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.UserService;

/**
 * SetUpTestDB
 */
@Component
public class SetUpTestDB implements ApplicationRunner {

    public static User adminUser;

    private Logger logger = LoggerFactory.getLogger(SetUpTestDB.class);

    @Autowired
    private UserService userService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        CreateUserDTO userToCreate = new CreateUserDTO("admin", "admin", new ArrayList<>(),
                Arrays.asList(Role.ADMIN), "admin", "admin");
        SetUpTestDB.adminUser = userService.createUser(userToCreate);

        logger.info("Debug test admin created.");
    }


}
