package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.UserDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.UserRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * UserDataAccessService
 */
@Repository
public class UserDataAccessService implements UserDao {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User saveUser(final User user) {
        return userRepository.save(user);
    }

    @Override
    public User findByUsername(final String username) throws ElementNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            throw new ElementNotFoundException("User with the given username was not found.");
        }

        return user.get();
    }

    @Override
    public User getUser(final UUID id) throws ElementNotFoundException {
        Optional<User> user = userRepository.findById(id);

        if (user.isEmpty()) {
            throw new ElementNotFoundException("User with the given ID was not found.");
        }

        return user.get();
    }

    @Override
    public void deleteUser(final UUID id) throws ElementNotFoundException {
        try {
            userRepository.deleteById(id);

        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }
    }

    @Override
    public List<Tutorial> getTutorialsOfUser(final UUID id) throws ElementNotFoundException {
        User user = getUser(id);

        return user.getTutorials();
    }

    @Override
    public List<Role> getRolesOfUser(final UUID id) throws ElementNotFoundException {
        return getUser(id).getRoles();
    }
}
