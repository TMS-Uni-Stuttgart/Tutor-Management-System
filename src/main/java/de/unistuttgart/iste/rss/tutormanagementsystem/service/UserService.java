package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.UserDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.EditUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * UserService
 */
@Service
public class UserService {

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userDao.getAllUsers();
    }

    public User createUser(final CreateUserDTO userDTO) throws ElementNotFoundException {
        List<Tutorial> tutorialsOfUser = new ArrayList<>();
        for (UUID tutorialId : userDTO.getTutorials()) {
            tutorialsOfUser.add(tutorialService.getTutorial(tutorialId));
        }

        User userToCreate = new User(UUID.randomUUID(), userDTO.getLastname(),
                userDTO.getFirstname(), tutorialsOfUser, userDTO.getRoles(), userDTO.getUsername(),
                passwordEncoder.encode(userDTO.getPassword()));

        userToCreate.setTemporaryPassword(userDTO.getPassword());

        User userCreated = userDao.saveUser(userToCreate);

        for (Tutorial tutorial : tutorialsOfUser) {
            tutorialService.setUserOfTutorial(tutorial.getId(), userCreated.getId());
        }

        return userCreated;
    }

    public User getUser(final UUID id) throws ElementNotFoundException {
        return userDao.getUser(id);
    }

    public User findByUsername(final String username) throws ElementNotFoundException {
        return userDao.findByUsername(username);
    }

    public User updateUser(final UUID id, final EditUserDTO updatedUser)
            throws ElementNotFoundException {
        User user = getUser(id);
        List<Tutorial> tutorials = new ArrayList<>();

        for (var tutorial : user.getTutorials()) {
            tutorialService.removeUserOfTutorial(tutorial.getId());
        }

        for (var tutorialId : updatedUser.getTutorials()) {
            tutorialService.setUserOfTutorial(tutorialId, id);
            tutorials.add(tutorialService.getTutorial(tutorialId));
        }

        return userDao.saveUser(
                new User(user.getId(), updatedUser.getLastname(), updatedUser.getFirstname(),
                        tutorials, updatedUser.getRoles(), user.getUsername(), user.getPassword()));
    }

    public void deleteUser(final UUID id) throws ElementNotFoundException {
        User user = getUser(id);

        for (var tutorial : user.getTutorials()) {
            tutorialService.removeUserOfTutorial(tutorial.getId());
        }

        userDao.deleteUser(id);
    }

    public List<Tutorial> getTutorialsOfUser(final UUID id) throws ElementNotFoundException {
        return userDao.getTutorialsOfUser(id);
    }

    public void setTutorialsOfUser(final UUID id, final List<UUID> tutorials)
            throws ElementNotFoundException {
        User user = userDao.getUser(id);

        for (var tutorial : user.getTutorials()) {
            tutorialService.removeUserOfTutorial(tutorial.getId());
        }

        for (var tutorialId : tutorials) {
            tutorialService.setUserOfTutorial(tutorialId, id);
        }

        // userDao.saveUser(user);
    }

    public List<Role> getRoleOfUser(final UUID id) throws ElementNotFoundException {
        return userDao.getRolesOfUser(id);
    }

    // public void setRoleOfUser(final UUID id, final Role role) throws ElementNotFoundException {
    // User user = getUser(id);

    // userDao.saveUser(
    // new User(
    // id, user.getLastname(),
    // user.getFirstname(),
    // user.getTutorials(),
    // role,
    // user.getUsername(),
    // user.getPassword()
    // )
    // );
    // }

    public void updatePasswordOfUser(final UUID id, final String newPassword)
            throws ElementNotFoundException {
        User user = getUser(id);

        userDao.saveUser(new User(id, user.getLastname(), user.getFirstname(), user.getTutorials(),
                user.getRoles(), user.getUsername(), passwordEncoder.encode(newPassword)));
    }

    public void setTemporaryPasswordOfUser(final UUID id, final String newTemporaryPassword)
            throws ElementNotFoundException {
        User user = getUser(id);

        updatePasswordOfUser(id, newTemporaryPassword);
        user.setTemporaryPassword(newTemporaryPassword);
        userDao.saveUser(user);
    }
}
