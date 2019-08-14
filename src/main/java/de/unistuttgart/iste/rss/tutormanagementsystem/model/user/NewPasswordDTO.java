package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import javax.validation.constraints.NotBlank;
import lombok.Getter;

/**
 * NewPasswordDTO
 */
@Getter
public class NewPasswordDTO {

    @NotBlank
    private String password;
}
