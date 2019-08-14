package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CreateUserDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.UserResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * UserControllerTest
 */
public class UserControllerTest extends TestConfiguration {

    @Autowired
    private TutorialService tutorialService;

    private ZoneId utcZone = ZoneId.of("UTC");

    @DisplayName("Create a user with no tutorials.")
    @Test
    public void testCreatingUserWithoutTutorials() {
        CreateUserDTO userToCreate = new CreateUserDTO("Testfrau", "Tanja", new ArrayList<>(),
                Arrays.asList(Role.ADMIN), "testfrta", "testfrau");

        UserResponseDTO createdUser = addUserToDatabase(userToCreate);

        assertUserEqualsToCreateUserDTO(userToCreate, createdUser);
    }

    @DisplayName("Create an User with one Tutorial.")
    @Test
    public void testCreatingUserWithTutorial() throws ElementNotFoundException {
        Tutorial tutorial = tutorialService.createTutorial(new TutorialDTO(24, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));
        CreateUserDTO userToCreate = new CreateUserDTO("Mustermann", "Max",
                new ArrayList<>(Arrays.asList(tutorial.getId())), Arrays.asList(Role.CORRECTOR),
                "mustermx", "mustermann");
        UserResponseDTO createdUser = addUserToDatabase(userToCreate);

        assertUserEqualsToCreateUserDTO(userToCreate, createdUser);
    }

    @DisplayName("Create a User with more than one tutorial.")
    @Test
    public void testCreatingUserWithMultipleTutorials() throws ElementNotFoundException {
        List<UUID> tutorialList = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            tutorialList.add(tutorialService.createTutorial(new TutorialDTO(i, null,
                    new ArrayList<>(),
                    ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                    ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()))
                    .getId());
        }

        CreateUserDTO userToCreate = new CreateUserDTO("Samplewomen", "Sabine", tutorialList,
                Arrays.asList(Role.TUTOR), "samplewomen", "samplewomen");

        UserResponseDTO createdUser = addUserToDatabase(userToCreate);

        assertUserEqualsToCreateUserDTO(userToCreate, createdUser);
    }

    @DisplayName("Get a User with a specific ID.")
    @Test
    public void testGetUserWithId() throws ElementNotFoundException {
        Tutorial tutorial = tutorialService.createTutorial(new TutorialDTO(17, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));

        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Potter", "Harry",
                new ArrayList<>(Arrays.asList(tutorial.getId())), Arrays.asList(Role.TUTOR),
                "potterhy", "potter"));

        ResponseEntity<UserResponseDTO> getUserResponse = restTemplate.getForEntity(
                getDatabaseURLToUserEndpoint() + "/" + user.getId(), UserResponseDTO.class);

        UserResponseDTO retrievedUser = getUserResponse.getBody();

        assertEquals(HttpStatus.OK, getUserResponse.getStatusCode(),
                "User was found on the server.");
        assertNotNull(retrievedUser, "The response body contains the user.");

        assertUserEquals(user, retrievedUser);
    }

    @DisplayName("Delete a User without a tutorial.")
    @Test
    public void testDeleteUserWithoutTutorial() {
        ResponseEntity<List<UserResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});
        int currentUserCount = response.getBody().size();

        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Fakemann", "Franz",
                new ArrayList<>(), Arrays.asList(Role.EMPLOYEE), "fakemafz", "fakemann"));

        restTemplate.delete(getDatabaseURLToUserEndpoint() + "/" + user.getId());

        ResponseEntity<List<UserResponseDTO>> responseAfterDeletion =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});

        assertEquals(currentUserCount, responseAfterDeletion.getBody().size(),
                "User was deleted from the database");
    }

    @DisplayName("Delete a user with tutorials")
    @Test
    public void testDeleteUserWithTutorial() throws ElementNotFoundException {
        ResponseEntity<List<UserResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});
        int currentUserCount = response.getBody().size();

        Tutorial tutorial = tutorialService.createTutorial(new TutorialDTO(42, null,
                new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()));

        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Weasley", "Ron",
                new ArrayList<>(Arrays.asList(tutorial.getId())), Arrays.asList(Role.TUTOR),
                "weaslern", "weasley"));

        ResponseEntity<TutorialResponseDTO> tutorialResponseBeforeDeletion =
                restTemplate.getForEntity(getDatabaseURL("tutorial/" + tutorial.getId()),
                        TutorialResponseDTO.class);
        TutorialResponseDTO tutorialBeforeDeletion = tutorialResponseBeforeDeletion.getBody();

        assertEquals(HttpStatus.OK, tutorialResponseBeforeDeletion.getStatusCode(),
                "Tutorial was retrieved from the database.");
        assertNotNull(tutorialBeforeDeletion, "Body of tutorial response is not null.");
        assertEquals(user.getId(), tutorialBeforeDeletion.getTutor().get());

        restTemplate.delete(getDatabaseURLToUserEndpoint() + "/" + user.getId());

        ResponseEntity<List<UserResponseDTO>> responseAfterDeletion =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});

        assertEquals(currentUserCount, responseAfterDeletion.getBody().size(),
                "User was deleted from the database.");

        ResponseEntity<TutorialResponseDTO> tutorialResponse = restTemplate.getForEntity(
                getDatabaseURL("tutorial/" + tutorial.getId()), TutorialResponseDTO.class);

        assertEquals(HttpStatus.OK, tutorialResponse.getStatusCode(),
                "Tutorial was retrieved from the database.");
        assertNotNull(tutorialResponse.getBody(), "Body of tutorial response is not null.");
        assertTrue(tutorialResponse.getBody().getTutor().isEmpty(),
                "Tutorial has no user anymore.");

    }

    @DisplayName("Get the tutorials of a user if the user has none")
    @Test
    public void testGetAllTutorialsOfAUserWithZeroTutorials() throws ElementNotFoundException {
        testGetAllTutorialsOfUser(0);
    }

    @DisplayName("Get the tutorials of a user if the user has one tutorials")
    @Test
    public void testGetAllTutorialsOfAUserWithOneTutorials() throws ElementNotFoundException {
        testGetAllTutorialsOfUser(1);
    }

    @DisplayName("Get the tutorials of a user if the user has multiple tutorials")
    @Test
    public void testGetAllTutorialsOfAUserWithMultipleTutorials() throws ElementNotFoundException {
        testGetAllTutorialsOfUser(3);
    }

    /**
     * Checks if one can retrieved the tutorials of a created user from the database.
     * 
     * First this method creates a user with the given amount of tutorials (which will be created
     * aswell) and adds the tutorials and the user to the database.
     * 
     * Afterwards the tutorials of that user are being requested and compared to the list of created
     * tutorials.
     * 
     * Finally the created user gets deleted from the database to prevent future naming conflicts.
     * 
     * @param tutorialCount Amount of tutorials created for the user.
     * @throws ElementNotFoundException
     */
    private void testGetAllTutorialsOfUser(final int tutorialCount)
            throws ElementNotFoundException {
        List<UUID> tutorialIDs = new ArrayList<>();

        for (int i = 0; i < tutorialCount; i++) {
            tutorialIDs.add(tutorialService.createTutorial(new TutorialDTO(i, null,
                    new ArrayList<>(),
                    ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone).toLocalTime(),
                    ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone).toLocalTime()))
                    .getId());
        }

        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Granger", "Hermine",
                tutorialIDs, Arrays.asList(Role.TUTOR), "grangehe", "granger"));

        ResponseEntity<List<TutorialResponseDTO>> response = restTemplate.exchange(
                getDatabaseURLToUserEndpoint() + "/" + user.getId() + "/tutorial", HttpMethod.GET,
                null, new ParameterizedTypeReference<List<TutorialResponseDTO>>() {});

        assertTutorialsEqualWithUUIDCollection(tutorialIDs, response.getBody());

        // Delete the created user so it can be added again later -- this is done due to the fact
        // that this
        // method can be recycled.
        restTemplate.delete(getDatabaseURLToUserEndpoint() + "/" + user.getId());
    }

    @DisplayName("Test updating a user without a tutorial.")
    @Test
    public void testUpdateAUserWithoutATutorial() throws ElementNotFoundException {
        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Dumbledore", "Albus",
                new ArrayList<>(), Arrays.asList(Role.ADMIN), "dumbleas", "dumbledore"));
        CreateUserDTO updatedUser = new CreateUserDTO("Snape", "Severus", new ArrayList<>(),
                Arrays.asList(Role.TUTOR), "severuse", "severus");

        UserResponseDTO userUpdateResponse =
                restTemplate.patchForObject(getDatabaseURLToUserEndpoint() + "/" + user.getId(),
                        updatedUser, UserResponseDTO.class);

        assertUserEqualsToCreateUserDTO(updatedUser, userUpdateResponse);
    }

    @DisplayName("Test updating a user with multiple tutorials.")
    @Test
    public void testUpdateAUserWithATutorial() throws ElementNotFoundException {
        List<UUID> listOfTutorials =
                new ArrayList<>(
                        Arrays.asList(
                                tutorialService.createTutorial(new TutorialDTO(11, null,
                                        new ArrayList<>(),
                                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45),
                                                utcZone).toLocalTime(),
                                        ZonedDateTime
                                                .of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                                .toLocalTime()))
                                        .getId(),
                                tutorialService.createTutorial(new TutorialDTO(12, null,
                                        new ArrayList<>(),
                                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45),
                                                utcZone).toLocalTime(),
                                        ZonedDateTime
                                                .of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                                .toLocalTime()))
                                        .getId(),
                                tutorialService.createTutorial(new TutorialDTO(13, null,
                                        new ArrayList<>(),
                                        ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45),
                                                utcZone).toLocalTime(),
                                        ZonedDateTime
                                                .of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                                .toLocalTime()))
                                        .getId()));
        List<UUID> listOfTutorialsAfterUpdate =
                new ArrayList<>(Arrays.asList(listOfTutorials.get(1), listOfTutorials.get(0),
                        tutorialService.createTutorial(new TutorialDTO(14, null, new ArrayList<>(),
                                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone)
                                        .toLocalTime(),
                                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                        .toLocalTime()))
                                .getId(),
                        tutorialService.createTutorial(new TutorialDTO(15, null, new ArrayList<>(),
                                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), utcZone)
                                        .toLocalTime(),
                                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), utcZone)
                                        .toLocalTime()))
                                .getId()));

        UserResponseDTO user = addUserToDatabase(new CreateUserDTO("Draco", "Malfoy",
                listOfTutorials, Arrays.asList(Role.CORRECTOR), "malfoydo", "malfoy"));

        CreateUserDTO updatedUser = new CreateUserDTO("Lucius", "Malfoy",
                listOfTutorialsAfterUpdate, Arrays.asList(Role.EMPLOYEE), "luciusdo", "malfoy");

        UserResponseDTO userAfterUpdate =
                restTemplate.patchForObject(getDatabaseURLToUserEndpoint() + "/" + user.getId(),
                        updatedUser, UserResponseDTO.class);

        assertUserEqualsToCreateUserDTO(updatedUser, userAfterUpdate);
    }

    /**
     * Checks if two Users are equal.
     * 
     * This function internally uses {@link Assertions} so it can be used inside JUnit tests.
     * 
     * @param expected What the User object should be like.
     * @param actual What the User object is.
     */
    private void assertUserEquals(final UserResponseDTO expected, final UserResponseDTO actual) {
        assertNotNull(actual, "User is not null.");
        assertEquals(expected.getId(), actual.getId(), "IDs match");
        assertEquals(expected.getLastname(), actual.getLastname(), "Lastname is correct");
        assertEquals(expected.getFirstname(), actual.getFirstname(), "First name is correct.");
        assertEquals(expected.getRoles(), actual.getRoles(), "Roles are correct.");

        assertEquals(expected.getTutorials(), actual.getTutorials(), "Tutorials are equal.");
    }

    /**
     * Checks if the users are "equal".
     * 
     * Equality is defined as having the same attributes but one is represented as
     * {@see CreateUserDTO} while the other is represented as {@see User} and all attributes are
     * getting compared.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected user structure.
     * @param actual Actual user object.
     */
    private void assertUserEqualsToCreateUserDTO(final CreateUserDTO expected,
            final UserResponseDTO actual) {
        assertNotNull(actual, "User is not null.");
        assertEquals(expected.getLastname(), actual.getLastname(), "Lastname is correct");
        assertEquals(expected.getFirstname(), actual.getFirstname(), "First name is correct.");
        assertEquals(expected.getRoles(), actual.getRoles(), "Roles are correct.");

        assertEquals(expected.getTutorials(), actual.getTutorials());
    }

    /**
     * Checks the two {@see Tutorial} collections are "equal".
     * 
     * Equality is defined as having the same size and containing the same items. However the
     * representation of the items differ: In one list they are represented with their UUID and in
     * the other as their actual objects.
     * 
     * Uses the JUnit assert function {@see Assertions#assertTrue} internally, so it can be used
     * inside JUnit tests.
     * 
     * @param expected List of the expected UUIDs of the tutorials.
     * @param actual List of the actual tutorials.
     */
    private void assertTutorialsEqualWithUUIDCollection(final Collection<UUID> expected,
            final Collection<TutorialResponseDTO> actual) {
        assertEquals(expected.size(), actual.size(), "Matching number of tutorials.");

        for (var tutorial : actual) {
            assertTrue(expected.contains(tutorial.getId()),
                    "Contains tutorial with ID \"" + tutorial.getId() + "\"");
        }
    }

    /**
     * Adds a user to the DB via a request.
     * 
     * This function also checks if the response has the correct status code aswell as that the
     * created user gets returned by the request. These checks are done with {@link Assertions} so
     * this function can be used inside JUnit tests.
     * 
     * @param userToCreate Information of the User to create.
     * @return The created User
     */
    private UserResponseDTO addUserToDatabase(final CreateUserDTO userToCreate) {
        // We cannot use the getForEntity method here bc in it one cannot specify a parameterized
        // type.
        ResponseEntity<List<UserResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});
        int currentUserCount = response.getBody().size();

        ResponseEntity<UserResponseDTO> createUserResponse = restTemplate
                .postForEntity(getDatabaseURLToUserEndpoint(), userToCreate, UserResponseDTO.class);
        UserResponseDTO user = createUserResponse.getBody();

        assertEquals(HttpStatus.CREATED, createUserResponse.getStatusCode(),
                "Status code for successfully creating the user.");
        assertNotNull(user, "Created User got returned.");

        ResponseEntity<List<UserResponseDTO>> responseAfterAdding =
                restTemplate.exchange(getDatabaseURLToUserEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<UserResponseDTO>>() {});

        assertEquals(currentUserCount + 1, responseAfterAdding.getBody().size(),
                "User was added to the database.");

        return user;
    }

    /**
     * @return URL of the database server pointing to the /user endpoint.
     */
    private String getDatabaseURLToUserEndpoint() {
        return getDatabaseURL("user");
    }
}
