package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * TeamControllerTest
 */
public class TeamControllerTest extends TestConfiguration {

    private final ZoneId UTC_ZONE = ZoneId.of("UTC");
    private Tutorial tutorial = null;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TutorialService tutorialService;

    @BeforeEach
    public void initTutorial() throws ElementNotFoundException {
        TutorialDTO tutorialDTO = new TutorialDTO(42, null, new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), UTC_ZONE).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), UTC_ZONE).toLocalTime());

        tutorial = tutorialService.createTutorial(tutorialDTO);
    }

    @DisplayName("Create a team with no students and no points")
    @Test
    public void testCreatingTeamWithoutStudentsAndPoints() {
        TeamDTO teamToCreate = new TeamDTO();
        TeamResponseDTO team = addTeamToDatabase(teamToCreate);

        assertTeamEqualToCreateTeamDTO(teamToCreate, team);
    }

    @DisplayName("Create a team with students but no points")
    @Test
    public void testCreatingTeamWithStudentsAndWithoutPoints() throws ElementNotFoundException {
        List<UUID> studentIds = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            studentIds.add(
                    studentService.createStudent(new StudentDTO("lastname" + i, "firstname" + i,
                            Integer.toString(i) + Integer.toString(i) + Integer.toString(i), null,
                            tutorial.getId())).getId());
        }

        TeamDTO teamToCreate = new TeamDTO(12, studentIds);

        TeamResponseDTO team = addTeamToDatabase(teamToCreate);

        assertTeamEqualToCreateTeamDTO(teamToCreate, team);
    }

    @DisplayName("Delete a team")
    @Test
    public void testDeleteATeam() {
        ResponseEntity<List<TeamResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});
        int currentTeamCount = response.getBody().size();

        TeamResponseDTO team = addTeamToDatabase(new TeamDTO());

        restTemplate.delete(getDatabaseURLToTeamEndpoint() + "/" + team.getId());

        ResponseEntity<List<TeamResponseDTO>> responseAfterDeletion =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});

        assertEquals(currentTeamCount, responseAfterDeletion.getBody().size(),
                "Team was deleted from the database");
    }

    @DisplayName("Delete a team with students")
    @Test
    public void testDeleteATeamWithStudents() throws ElementNotFoundException {
        ResponseEntity<List<TeamResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});
        int currentTeamCount = response.getBody().size();

        ResponseEntity<List<StudentResponseDTO>> studentsResponse =
                restTemplate.exchange(getDatabaseURL("student"), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<StudentResponseDTO>>() {});
        int currentStudentCount = studentsResponse.getBody().size();

        Student firstStudent = studentService
                .createStudent(new StudentDTO("Potter", "Harry", "1234", null, tutorial.getId()));
        Student secondStudent = studentService
                .createStudent(new StudentDTO("Weasley", "Ron", "12345", null, tutorial.getId()));

        List<UUID> students = new ArrayList<>();
        students.add(firstStudent.getId());
        students.add(secondStudent.getId());

        TeamResponseDTO team = addTeamToDatabase(new TeamDTO(42, students));

        restTemplate.delete(getDatabaseURLToTeamEndpoint() + "/" + team.getId());

        ResponseEntity<List<TeamResponseDTO>> responseAfterDeletion =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});

        ResponseEntity<List<StudentResponseDTO>> studentsResponseAfterDeletion =
                restTemplate.exchange(getDatabaseURL("student"), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<StudentResponseDTO>>() {});
        int studentCountAfterDeletion = studentsResponseAfterDeletion.getBody().size();

        assertEquals(currentTeamCount, responseAfterDeletion.getBody().size(),
                "Team was deleted from the database");
        assertEquals(currentStudentCount + students.size(), studentCountAfterDeletion,
                "Students are still there (and API is still alive)");
    }

    @DisplayName("Update a Team")
    @Test
    public void testUpdateATeam() throws ElementNotFoundException {
        TeamResponseDTO team = addTeamToDatabase(new TeamDTO());
        ResponseEntity<List<TeamResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});
        int currentTeamCount = response.getBody().size();

        Student student = studentService
                .createStudent(new StudentDTO("Potter", "Harry", "1234", null, tutorial.getId()));

        List<UUID> students = new ArrayList<>();
        students.add(student.getId());

        TeamDTO updatedTeam = new TeamDTO(17, students);

        TeamResponseDTO newTeam =
                restTemplate.patchForObject(getDatabaseURLToTeamEndpoint() + "/" + team.getId(),
                        updatedTeam, TeamResponseDTO.class);

        ResponseEntity<List<TeamResponseDTO>> responseAfterUpdate =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});

        assertEquals(HttpStatus.OK, responseAfterUpdate.getStatusCode(), "Update was successfull");
        assertEquals(currentTeamCount, responseAfterUpdate.getBody().size(),
                "Team was successfully updated");
        assertTeamEqualToCreateTeamDTO(updatedTeam, newTeam);
    }

    /**
     * Checks if the teams are "equal".
     * 
     * Equality is defined as having the same attributes but one is represented as
     * {@see CreateTeamDTO} while the other is represented as {@see Team} and all attributes are
     * getting compared.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected team structure.
     * @param actual Actual team object.
     */
    private void assertTeamEqualToCreateTeamDTO(final TeamDTO expected,
            final TeamResponseDTO actual) {
        assertNotNull(actual, "Team is not null.");

        assertEquals(expected.getTeamNo(), actual.getTeamNo(), "Team numbers are equal");
        assertTeamsEqualWithUUIDCollection(expected.getStudents(), actual.getStudents());
    }

    /**
     * Checks the two {@see Team} collections are "equal".
     * 
     * Equality is defined as having the same size and containing the same items. However the
     * representation of the items differ: In one list they are represented with their UUID and in
     * the other as a List of students.
     * 
     * Uses the JUnit assert function {@see Assertions#assertTrue} internally, so it can be used
     * inside JUnit tests.
     * 
     * @param expected List of the expected UUIDs of the teams.
     * @param actual List of the students.
     */
    private void assertTeamsEqualWithUUIDCollection(final Collection<UUID> expected,
            final Collection<StudentResponseDTO> actual) {
        assertEquals(expected.size(), actual.size(), "Matching number of students.");

        for (var team : actual) {
            assertTrue(expected.contains(team.getId()),
                    "Contains team with ID \"" + team.getId() + "\"");
        }
    }


    /**
     * Adds a team to the DB via a request.
     * 
     * This function also checks if the response has the correct status code aswell as that the
     * created team gets returned by the request. These checks are done with {@link Assertions} so
     * this function can be used inside JUnit tests.
     * 
     * @param userToCreate Information of the Team to create.
     * @return The created Team
     */
    private TeamResponseDTO addTeamToDatabase(final TeamDTO teamToCreate) {
        int currentTeamCount = getTeamsInDB().size();

        ResponseEntity<TeamResponseDTO> createTeamResponse = restTemplate
                .postForEntity(getDatabaseURLToTeamEndpoint(), teamToCreate, TeamResponseDTO.class);
        TeamResponseDTO team = createTeamResponse.getBody();

        assertEquals(HttpStatus.CREATED, createTeamResponse.getStatusCode(),
                "Status code for successfully creating the team.");
        assertNotNull(team, "Created team got returned.");

        assertEquals(currentTeamCount + 1, getTeamsInDB().size(),
                "Team was added to the database.");

        return team;
    }

    private List<TeamResponseDTO> getTeamsInDB() {
        ResponseEntity<List<TeamResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToTeamEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<TeamResponseDTO>>() {});

        return response.getBody();
    }

    private String getDatabaseURLToTeamEndpoint() {
        return getDatabaseURL("tutorial/" + tutorial.getId() + "/team");
    }

}
