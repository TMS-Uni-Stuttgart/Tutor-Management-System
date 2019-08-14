package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.Role;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.UserResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.UserService;

/**
 * TutorialControllerTest
 */
public class TutorialControllerTest extends TestConfiguration {

    @Autowired
    private UserService userService;

    @Autowired
    private StudentService studentService;

    private ZoneId utcZone = ZoneId.of("UTC");

    @DisplayName("Create a tutorial with no tutor and no dates")
    @Test
    public void testCreatingTutorialWithoutTutorAndDates() {
        TutorialDTO tutorialToCreate = new TutorialDTO(42, null, new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime());
        TutorialResponseDTO tutorial = addTutorialToDatabase(tutorialToCreate);

        assertTutorialEqualToCreateTutorialDTO(tutorialToCreate, tutorial);
    }

    @DisplayName("Create a tutorial with a tutor and no dates")
    @Test
    public void testCreatingTutorialWithTutorButWithoutDates() throws ElementNotFoundException {
        User tutor = userService.createUser(new CreateUserDTO("potter", "harry", new ArrayList<>(),
                Arrays.asList(Role.TUTOR), "potterhy", "potter"));
        TutorialDTO tutorialToCreate = new TutorialDTO(12, tutor.getId(), new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime());

        TutorialResponseDTO tutorial = addTutorialToDatabase(tutorialToCreate);

        assertTutorialEqualToCreateTutorialDTO(tutorialToCreate, tutorial);
    }

    @DisplayName("Create a tutorial with a tutor and some dates")
    @Test
    public void testCreatingTutorialWithTutorAndDates() throws ElementNotFoundException {
        List<Instant> dates = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            dates.add(ZonedDateTime.of(2019, 05, 11 + i, 0, 0, 0, 0, ZoneId.of("UTC")).toInstant());
        }

        User tutor = userService.createUser(new CreateUserDTO("potter", "ginny", new ArrayList<>(),
                Arrays.asList(Role.TUTOR), "pottergy", "potter"));
        TutorialDTO tutorialToCreate = new TutorialDTO(12, tutor.getId(), dates,
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime());

        TutorialResponseDTO tutorial = addTutorialToDatabase(tutorialToCreate);

        assertTutorialEqualToCreateTutorialDTO(tutorialToCreate, tutorial);
    }

    @DisplayName("Add a tutorial with some correctors")
    @Test
    public void testCreatingTutorialWithCorrectors() throws ElementNotFoundException {
        List<UUID> correctorIds = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            correctorIds.add(userService
                    .createUser(
                            new CreateUserDTO("Corrector", Integer.toString(i), new ArrayList<>(),
                                    Arrays.asList(Role.CORRECTOR), "corrector" + i, "corrector"))
                    .getId());
        }

        TutorialDTO tutorialToCreate = new TutorialDTO(25, null, new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime(),
                correctorIds);
        TutorialResponseDTO tutorial = addTutorialToDatabase(tutorialToCreate);

        assertTutorialEqualToCreateTutorialDTO(tutorialToCreate, tutorial);
    }

    @DisplayName("Delete tutorial without a tutor")
    @Test
    public void testDeletingTutorialWithoutTutor() {
        TutorialResponseDTO tutorial = addTutorialToDatabase(new TutorialDTO(1, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));
        int currentTutorialCount = getTutorialsInDB().size();

        restTemplate.delete(getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId());

        ResponseEntity<TutorialResponseDTO> response = restTemplate.getForEntity(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                TutorialResponseDTO.class);

        assertEquals(currentTutorialCount - 1, getTutorialsInDB().size(),
                "DB contains one less tutorial.");
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode(), "Status code is correct.");
    }

    @DisplayName("Delete tutorial with a user")
    @Test
    public void testDeletingTutorialWithTutor() throws ElementNotFoundException {
        User user = userService.createUser(new CreateUserDTO("Granger", "Hermine",
                new ArrayList<>(), Arrays.asList(Role.CORRECTOR), "grangehe", "granger"));

        TutorialResponseDTO tutorial = addTutorialToDatabase(new TutorialDTO(2, user.getId(),
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));

        int currentTutorialCount = getTutorialsInDB().size();

        restTemplate.delete(getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId());

        ResponseEntity<TutorialResponseDTO> tutorialResponse = restTemplate.getForEntity(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                TutorialResponseDTO.class);

        ResponseEntity<UserResponseDTO> userResponse = restTemplate
                .getForEntity(getDatabaseURL("user") + "/" + user.getId(), UserResponseDTO.class);

        assertEquals(currentTutorialCount - 1, getTutorialsInDB().size(),
                "DB contains one less tutorial.");
        assertEquals(HttpStatus.NOT_FOUND, tutorialResponse.getStatusCode(),
                "Status code for tutorial response is correct.");

        assertEquals(HttpStatus.OK, userResponse.getStatusCode(),
                "Status code for user response is correct.");
        assertEquals(user.getId(), userResponse.getBody().getId(), "User is still in the DB.");
    }

    @DisplayName("Delete tutorial with students")
    @Test
    public void testDeletingTutorialWithStudents() throws ElementNotFoundException {
        TutorialResponseDTO tutorial = addTutorialToDatabase(new TutorialDTO(2, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));
        int currentTutorialCount = getTutorialsInDB().size();

        studentService
                .createStudent(new StudentDTO("Weasley", "Ron", "1234", null, tutorial.getId()));

        ResponseEntity<Void> response =
                restTemplate.exchange(getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                        HttpMethod.DELETE, null, Void.class);

        ResponseEntity<TutorialResponseDTO> tutorialResponse = restTemplate.getForEntity(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                TutorialResponseDTO.class);

        assertEquals(currentTutorialCount, getTutorialsInDB().size(),
                "Tutorial is still in the DB");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(),
                "Status code for tutorial response is correct.");
        assertEquals(tutorial.getId(), tutorialResponse.getBody().getId(),
                "Response body is not empty.");
    }

    @DisplayName("Edit a tutorial by changing it's tutor")
    @Test
    public void testEditTutorialTutor() throws ElementNotFoundException {
        TutorialResponseDTO tutorial = addTutorialToDatabase(new TutorialDTO(17, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));
        User firstTutor = userService.createUser(new CreateUserDTO("Weasley", "George",
                new ArrayList<>(), Arrays.asList(Role.TUTOR), "weaslege", "weasley"));
        User secondTutor = userService.createUser(new CreateUserDTO("Weasley", "Fred",
                new ArrayList<>(), Arrays.asList(Role.TUTOR), "weaslefd", "weasley"));

        assertTrue(tutorial.getTutor().isEmpty(), "Tutorial has no user");;

        TutorialResponseDTO firstResponse = restTemplate.patchForObject(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                new TutorialDTO(tutorial.getSlot(), firstTutor.getId(), tutorial.getDates(),
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone)
                                .toLocalTime(),
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                .toLocalTime()),
                TutorialResponseDTO.class);

        assertEquals(firstTutor.getId(), firstResponse.getTutor().get(),
                "Tutorial has first tutor as tutor.");

        TutorialResponseDTO secondResponse = restTemplate.patchForObject(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                new TutorialDTO(tutorial.getSlot(), secondTutor.getId(), tutorial.getDates(),
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone)
                                .toLocalTime(),
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                .toLocalTime()),
                TutorialResponseDTO.class);

        assertEquals(secondTutor.getId(), secondResponse.getTutor().get(),
                "Tutorial has second tutor as tutor.");
    }

    @DisplayName("Edit a tutorial by changing its date")
    @Test
    public void testEditTutorialDates() {
        List<Instant> dates = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            dates.add(ZonedDateTime.of(2019, 05, 11 + i, 0, 0, 0, 0, ZoneId.of("UTC")).toInstant());
        }

        TutorialResponseDTO tutorial = addTutorialToDatabase(new TutorialDTO(17, null, dates,
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));

        List<Instant> newDates = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            dates.add(ZonedDateTime.of(2019, 10, 11 + i, 0, 0, 0, 0, ZoneId.of("UTC")).toInstant());
        }

        TutorialResponseDTO response = restTemplate.patchForObject(
                getDatabaseURLToTutorialEndpoint() + "/" + tutorial.getId(),
                new TutorialDTO(tutorial.getSlot(),
                        tutorial.getTutor().isPresent() ? tutorial.getTutor().get() : null,
                        newDates,
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone)
                                .toLocalTime(),
                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                .toLocalTime()),
                TutorialResponseDTO.class);

        assertEquals(newDates, response.getDates(), "Dates are updated");
    }

    /**
     * Checks if the tutorials are "equal".
     * 
     * Equality is defined as having the same attributes but one is represented as
     * {@see CreateTutorialDTO} while the other is represented as {@see Tutorial} and all attributes
     * are getting compared.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected tutorial structure.
     * @param actual Actual tutorial object.
     */
    private void assertTutorialEqualToCreateTutorialDTO(final TutorialDTO expected,
            final TutorialResponseDTO actual) {
        assertNotNull(actual, "Tutorial is not null.");

        assertEquals(expected.getSlot(), actual.getSlot(), "Slots are equal");
        assertTrue(() -> {
            if (expected.getTutorId().isEmpty() && actual.getTutor().isEmpty()) {
                return true;
            }

            if (expected.getTutorId().isPresent() && actual.getTutor().isPresent()) {
                return actual.getTutor().get().equals(expected.getTutorId().get());
            } else {
                return false;
            }
        }, "Tutor is equal.");

        assertEquals(expected.getDates(), actual.getDates(), "Dates are equal.");

        assertEquals(expected.getStartTime(), actual.getStartTime(), "Start times are equal");
        assertEquals(expected.getEndTime(), actual.getEndTime(), "End times are equal");

        assertTrue(() -> {
            if (expected.getCorrectorIds().size() != actual.getCorrectors().size()) {
                return false;
            }

            for (var id : expected.getCorrectorIds()) {
                if (actual.getCorrectors().stream().filter(user -> user.equals(id)).findFirst()
                        .isEmpty()) {
                    return false;
                }
            }

            return true;
        }, "Correctors are equal.");
    }

    /**
     * Adds a tutorial to the DB via a request.
     * 
     * This function also checks if the response has the correct status code aswell as that the
     * created tutorial gets returned by the request. These checks are done with {@link Assertions}
     * so this function can be used inside JUnit tests.
     * 
     * @param userToCreate Information of the Tutorial to create.
     * @return The created Tutorial
     */
    private TutorialResponseDTO addTutorialToDatabase(final TutorialDTO tutorialToCreate) {
        int currentTutorialCount = getTutorialsInDB().size();

        ResponseEntity<TutorialResponseDTO> createTutorialResponse = restTemplate.postForEntity(
                getDatabaseURLToTutorialEndpoint(), tutorialToCreate, TutorialResponseDTO.class);

        TutorialResponseDTO tutorial = createTutorialResponse.getBody();

        assertEquals(HttpStatus.CREATED, createTutorialResponse.getStatusCode(),
                "Status code for successfully creating the tutorial.");
        assertNotNull(tutorial, "Created tutorial got returned.");

        assertEquals(currentTutorialCount + 1, getTutorialsInDB().size(),
                "Tutorial was added to the database.");

        return tutorial;
    }

    private List<TutorialResponseDTO> getTutorialsInDB() {
        ResponseEntity<List<TutorialResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToTutorialEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TutorialResponseDTO>>() {});

        return response.getBody();
    }

    private String getDatabaseURLToTutorialEndpoint() {
        return getDatabaseURL("tutorial");
    }
}
