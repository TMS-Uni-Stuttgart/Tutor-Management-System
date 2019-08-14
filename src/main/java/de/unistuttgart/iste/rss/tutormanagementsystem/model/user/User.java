package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.persistence.Convert;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.lang.Nullable;
import de.unistuttgart.iste.rss.tutormanagementsystem.encrypter.StringAttibuteEncrypter;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.NamedElement;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import lombok.AccessLevel;
import lombok.Getter;

/**
 * User
 */
@Getter
@Entity
public class User extends NamedElement {

    @OneToMany(mappedBy = "tutor")
    private List<Tutorial> tutorials;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<Role> roles;

    @NotBlank
    private String username;

    @JsonIgnore
    private String password;

    @Convert(converter = StringAttibuteEncrypter.class)
    @Nullable
    @Getter(AccessLevel.NONE)
    private String temporaryPassword;

    User() {
        this(UUID.randomUUID(), "", "", new ArrayList<>(), Arrays.asList(Role.TUTOR), "", "");
    }

    public User(final UUID id, final String lastname, final String firstname,
            final List<Tutorial> tutorials, final List<Role> roles, final String username,
            final String password) {
        super(id, lastname, firstname);

        this.tutorials = new ArrayList<>(tutorials);
        this.roles = new ArrayList<>(roles);

        this.username = username;
        this.password = password;

        this.temporaryPassword = null;
    }

    public Optional<String> getTemporaryPassword() {
        return Optional.ofNullable(this.temporaryPassword);
    }

    public void setTemporaryPassword(final @NotBlank String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public void removeTemporaryPassword() {
        this.temporaryPassword = null;
    }

}
