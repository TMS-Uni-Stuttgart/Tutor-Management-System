package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.NamedElement;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import lombok.Getter;

/**
 * Represents a {@link User} returned by the REST API.
 */
@Getter
public class UserResponseDTO extends NamedElement {

    private final List<UUID> tutorials;

    private final List<Role> roles;

    private final String username;

    private final String temporaryPassword;

    UserResponseDTO() {
        this(new User());
    }

    public UserResponseDTO(final User user) {
        super(user.getId(), user.getLastname(), user.getFirstname());

        this.tutorials = HasId.convertToListOfUUIDs(user.getTutorials());
        this.roles = new ArrayList<>(user.getRoles());
        this.username = user.getUsername();
        this.temporaryPassword = user.getTemporaryPassword().orElse(null);
    }

}
