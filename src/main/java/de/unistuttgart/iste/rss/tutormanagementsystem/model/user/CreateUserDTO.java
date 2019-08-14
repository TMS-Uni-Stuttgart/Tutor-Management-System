package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import lombok.Getter;

/**
 * CreateUserDTO
 */
@Getter
public class CreateUserDTO extends EditUserDTO {

    private String username;
    private String password;

    CreateUserDTO() {}

    public CreateUserDTO(final String lastname, final String firstname, final List<UUID> tutorials,
            final List<Role> roles, final String username, final String password) {
        super(lastname, firstname, tutorials, roles);

        this.username = username;
        this.password = password;
    }

}
