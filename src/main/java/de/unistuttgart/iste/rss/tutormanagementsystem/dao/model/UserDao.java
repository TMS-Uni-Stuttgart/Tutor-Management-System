package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * UserDao
 */
public interface UserDao {

    public List<User> getAllUsers();

    public User saveUser(final User user);

    public User getUser(final UUID id) throws ElementNotFoundException;

    public User findByUsername(final String username) throws ElementNotFoundException;

    public void deleteUser(final UUID id) throws ElementNotFoundException;

    public List<Tutorial> getTutorialsOfUser(final UUID id) throws ElementNotFoundException;

    // public void setTutorialsOfUser(final UUID id, final List<Tutorial> tutorials) throws
    // ElementNotFoundException;

    public List<Role> getRolesOfUser(final UUID id) throws ElementNotFoundException;

    // public void setRoleOfUser(final UUID id, final Role newRole) throws ElementNotFoundException;

    // public void setLoginCredentialsOfUser(final UUID id, final String username, final String
    // password) throws ElementNotFoundException;

}
