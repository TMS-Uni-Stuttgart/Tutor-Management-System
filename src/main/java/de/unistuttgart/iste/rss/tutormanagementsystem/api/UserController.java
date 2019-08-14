package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.EditUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.NewPasswordDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.UserResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.UserService;

/**
 * UserController
 */
@RestController
@RequestMapping(path = "/api/user")
@ResponseBody
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public @ResponseBody List<UserResponseDTO> getAllUsers() {
        var allUsers = userService.getAllUsers();
        List<UserResponseDTO> responseList = allUsers.stream()
                .map(user -> new UserResponseDTO(user)).collect(Collectors.toList());

        return responseList;
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public UserResponseDTO createUser(@RequestBody @Valid CreateUserDTO userDTO)
            throws ElementNotFoundException {
        return new UserResponseDTO(userService.createUser(userDTO));
    }

    @GetMapping(path = "{id}")
    public UserResponseDTO getUser(@PathVariable UUID id) throws ElementNotFoundException {
        return new UserResponseDTO(userService.getUser(id));
    }

    @PatchMapping(path = "{id}")
    public UserResponseDTO patchUser(@PathVariable UUID id,
            @RequestBody @Valid EditUserDTO updatedUser) throws ElementNotFoundException {
        return new UserResponseDTO(userService.updateUser(id, updatedUser));
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) throws ElementNotFoundException {
        userService.deleteUser(id);
    }

    @GetMapping(path = "{id}/tutorial")
    public List<TutorialResponseDTO> getTutorialsOfUser(@PathVariable UUID id)
            throws ElementNotFoundException {
        var tutorials = userService.getTutorialsOfUser(id);
        List<TutorialResponseDTO> responseList = tutorials.stream()
                .map(tutorial -> new TutorialResponseDTO(tutorial)).collect(Collectors.toList());

        return responseList;
    }

    @PutMapping(path = "{id}/tutorial")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setTutorialsOfUser(@PathVariable UUID id, @RequestBody List<UUID> tutorials)
            throws ElementNotFoundException {

        userService.setTutorialsOfUser(id, tutorials);
    }

    @GetMapping(path = "{id}/role")
    public List<Role> getRoleOfUser(@PathVariable UUID id) throws ElementNotFoundException {
        return userService.getRoleOfUser(id);
    }

    @PostMapping(path = "{id}/password")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setPasswordOfUser(@PathVariable UUID id, @RequestBody NewPasswordDTO newPassword)
            throws ElementNotFoundException {
        userService.updatePasswordOfUser(id, newPassword.getPassword());
    }

    @PostMapping(path = "{id}/temporarypassword")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setTemporaryPasswordOfUser(@PathVariable UUID id,
            @RequestBody NewPasswordDTO newTemporaryPassword) throws ElementNotFoundException {
        userService.setTemporaryPasswordOfUser(id, newTemporaryPassword.getPassword());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return errors;
    }
}
