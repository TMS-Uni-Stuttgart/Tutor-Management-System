package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CustomUserDetails;

/**
 * WebSecurity
 */
@Service
@Transactional
public class WebSecurity {

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private StudentService studentService;

    public boolean hasReadWriteAccessToUser(final Authentication authentication,
            final UUID userId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN)) {
            return true;
        }

        return userDetails.getUserId().equals(userId);
    }

    public boolean hasReadWriteAccessToTutorialContent(final Authentication authentication,
            final UUID tutorialId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN)) {
            return true;
        }

        try {
            final Tutorial tutorial = tutorialService.getTutorial(tutorialId);

            return isTutorOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    public boolean hasReadWriteAccessToPointsOfTutorial(final Authentication authentication,
            final UUID tutorialId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN)) {
            return true;
        }

        try {
            final Tutorial tutorial = tutorialService.getTutorial(tutorialId);

            return isTutorOfTutorial(userDetails, tutorial)
                    || isCorrectorOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    public boolean hasReadAccessToTutorial(final Authentication authentication,
            final UUID tutorialId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN) || isRole(userDetails, Role.EMPLOYEE)) {
            return true;
        }

        try {
            final Tutorial tutorial = tutorialService.getTutorial(tutorialId);

            return isTutorOfTutorial(userDetails, tutorial)
                    || isSubstituteOfTutorial(userDetails, tutorial)
                    || isCorrectorOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    public boolean canCreateStudents(final Authentication authentication) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        return isRole(userDetails, Role.ADMIN) || isRole(userDetails, Role.TUTOR);
    }

    public boolean hasReadAccessToStudent(final Authentication authentication,
            final UUID studentId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN) || isRole(userDetails, Role.EMPLOYEE)) {
            return true;
        }

        try {
            final Student student = studentService.getStudent(studentId);
            final Tutorial tutorial = tutorialService.getTutorial(student.getTutorial().getId());

            return isTutorOfTutorial(userDetails, tutorial)
                    || isCorrectorOfTutorial(userDetails, tutorial)
                    || isSubstituteOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    public boolean hasReadWriteAccessToStudent(final Authentication authentication,
            final UUID studentId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN)) {
            return true;
        }

        try {
            final Student student = studentService.getStudent(studentId);
            final Tutorial tutorial = tutorialService.getTutorial(student.getTutorial().getId());

            return isTutorOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    public boolean hasReadWriteAccessToPointsOfStudent(final Authentication authentication,
            final UUID studentId) {
        final CustomUserDetails userDetails = getCustomUserDetails(authentication);

        if (userDetails == null) {
            return false;
        }

        if (isRole(userDetails, Role.ADMIN)) {
            return true;
        }

        try {
            final Student student = studentService.getStudent(studentId);
            final Tutorial tutorial = tutorialService.getTutorial(student.getTutorial().getId());

            return isTutorOfTutorial(userDetails, tutorial)
                    || isCorrectorOfTutorial(userDetails, tutorial);
        } catch (ElementNotFoundException e) {
            return false;
        }
    }

    private CustomUserDetails getCustomUserDetails(final Authentication authentication) {
        final Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails)) {
            return null;
        }

        return (CustomUserDetails) principal;
    }

    private boolean isRole(final CustomUserDetails userDetails, final Role role) {
        return userDetails.getAuthorities().contains(new SimpleGrantedAuthority(role.toString()));
    }

    private boolean isTutorOfTutorial(final CustomUserDetails userDetails,
            final Tutorial tutorial) {
        return tutorial.getTutor().isPresent()
                && tutorial.getTutor().get().getId().equals(userDetails.getUserId());
    }

    private boolean isSubstituteOfTutorial(final CustomUserDetails userDetails,
            final Tutorial tutorial) {
        return tutorial.getSubstitutes().values().contains(userDetails.getUserId());
    }

    private boolean isCorrectorOfTutorial(final CustomUserDetails userDetails,
            final Tutorial tutorial) {
        final var correctorIds =
                tutorial.getCorrectors().stream().map(c -> c.getId()).collect(Collectors.toList());

        return correctorIds.contains(userDetails.getUserId());
    }

}
