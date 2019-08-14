package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.util.List;
import java.util.UUID;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import lombok.Getter;

/**
 * UserDTO
 */
@Getter
public class EditUserDTO {

    private String lastname;
    private String firstname;

    private List<UUID> tutorials;

    @Enumerated(EnumType.STRING)
    private List<Role> roles;

    EditUserDTO() {}

    public EditUserDTO(final String lastname, final String firstname, final List<UUID> tutorials,
            final List<Role> roles) {
        this.lastname = lastname;
        this.firstname = firstname;
        this.roles = roles;
        this.tutorials = tutorials;
    }

}
