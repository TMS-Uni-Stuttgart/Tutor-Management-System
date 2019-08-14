package de.unistuttgart.iste.rss.tutormanagementsystem.model;

import java.util.UUID;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.validation.constraints.NotBlank;
import de.unistuttgart.iste.rss.tutormanagementsystem.encrypter.StringAttibuteEncrypter;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * Contains a lastname and a firstname property and is being used as {@link Entity}. The properties
 * are pre-configured in a way that they get encrypted if an NamedElement object is saved to the
 * database.
 */
@Getter
@Entity
@EqualsAndHashCode(callSuper = true)
public abstract class NamedElement extends HasId {

    @Convert(converter = StringAttibuteEncrypter.class)
    @NotBlank(message = "Missing last name")
    private final String lastname;

    @Convert(converter = StringAttibuteEncrypter.class)
    @NotBlank(message = "Missing first name")
    private final String firstname;

    public NamedElement(final UUID id, final String lastname, final String firstname) {
        super(id);

        this.lastname = lastname;
        this.firstname = firstname;
    }
}
