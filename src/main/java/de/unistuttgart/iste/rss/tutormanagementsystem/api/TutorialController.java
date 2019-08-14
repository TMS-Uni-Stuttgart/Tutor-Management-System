package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.TutorialNotEmptyException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaSummaryResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.SubstituteDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.UserResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * TutorialController
 */
@RestController
@RequestMapping(path = "/api/tutorial")
@ResponseBody
public class TutorialController {

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private StudentService studentService;

    @GetMapping
    public List<TutorialResponseDTO> getAllTutorials() {
        var allTutorials = tutorialService.getAllTutorials();
        return allTutorials.stream().map(user -> new TutorialResponseDTO(user))
                .collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public TutorialResponseDTO createTutorial(@RequestBody TutorialDTO tutorial)
            throws ElementNotFoundException {
        return new TutorialResponseDTO(tutorialService.createTutorial(tutorial));
    }

    @GetMapping(path = "{id}")
    public TutorialResponseDTO getTutorial(@PathVariable UUID id) throws ElementNotFoundException {
        return new TutorialResponseDTO(tutorialService.getTutorial(id));
    }

    @PatchMapping(path = "{id}")
    public TutorialResponseDTO updateTutorial(@PathVariable UUID id,
            @RequestBody TutorialDTO updatedTutorial) throws ElementNotFoundException {

        return new TutorialResponseDTO(tutorialService.updateTutorial(id, updatedTutorial));
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteTutorial(@PathVariable UUID id)
            throws ElementNotFoundException, TutorialNotEmptyException {
        tutorialService.deleteTutorial(id);
    }

    @GetMapping(path = "{id}/user")
    public Optional<UserResponseDTO> getUserOfTutorial(@PathVariable UUID id)
            throws ElementNotFoundException {
        var tutor = tutorialService.getUserOfTutorial(id);

        return tutor.isPresent() ? Optional.ofNullable(new UserResponseDTO(tutor.get()))
                : Optional.empty();
    }

    @PutMapping(path = "{id}/user")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setUserOfTutorial(@PathVariable UUID id, @RequestBody UUID userId)
            throws ElementNotFoundException {
        tutorialService.setUserOfTutorial(id, userId);
    }

    @GetMapping(path = "{id}/student")
    public List<StudentResponseDTO> getStudentsOfTutorial(@PathVariable UUID id)
            throws ElementNotFoundException {
        var students = tutorialService.getStudentsOfTutorial(id);

        return students.stream().map(student -> new StudentResponseDTO(student))
                .collect(Collectors.toList());
    }

    @GetMapping(path = "{id}/student/scheincriteria")
    public Map<UUID, ScheinCriteriaSummaryResponseDTO> getScheinCriteriaSummariesOfAllStudentsOfTutorial(
            @PathVariable UUID id) throws ElementNotFoundException {
        var students = tutorialService.getStudentsOfTutorial(id);
        Map<UUID, ScheinCriteriaSummaryResponseDTO> summaries = new HashMap<>();

        for (Student student : students) {
            var studentId = student.getId();
            summaries.put(studentId, studentService.getScheinCriteriaSummaryOfStudent(studentId));
        }

        return summaries;
    }

    @GetMapping(path = "{id}/corrector")
    public List<UserResponseDTO> getCorrectorsOfTutorial(@PathVariable UUID id)
            throws ElementNotFoundException {
        var correctors = tutorialService.getCorrectorsOfTutorial(id);

        return correctors.stream().map(corrector -> new UserResponseDTO(corrector))
                .collect(Collectors.toList());
    }

    @GetMapping(path = "{id}/substitute")
    public Map<Instant, UserResponseDTO> getSubstituesOfTutorial(@PathVariable UUID id)
            throws ElementNotFoundException {
        final Map<Instant, User> substitutes = tutorialService.getSubstitutesOfTutorial(id);
        final Map<Instant, UserResponseDTO> responseMap = new HashMap<>();

        for (var entry : substitutes.entrySet()) {
            responseMap.put(entry.getKey(), new UserResponseDTO(entry.getValue()));
        }

        return responseMap;
    }

    @PostMapping(path = "{id}/substitute")
    public TutorialResponseDTO setSubstituteOfTutorial(@PathVariable UUID id,
            @RequestBody SubstituteDTO substituteDTO) throws ElementNotFoundException {
        return new TutorialResponseDTO(tutorialService.setSubstituteOfTutorial(id, substituteDTO));
    }

}
