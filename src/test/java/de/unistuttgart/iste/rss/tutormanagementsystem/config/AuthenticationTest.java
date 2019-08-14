package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.ErrorBody;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.LoggedInUserResponseDTO;

/**
 * AuthenticationTest
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
public class AuthenticationTest {

    @LocalServerPort
    private int localPort;

    @Autowired
    public TestRestTemplate restTemplate;

    @Test
    public void testFailedLoginWithFalseCredentials() {
        ResponseEntity<ErrorBody> result = restTemplate.withBasicAuth("notAUser", "notAPassword")
                .postForEntity(getDatabaseURL("login"), null, ErrorBody.class);
        ErrorBody errorBody = result.getBody();

        assertEquals(result.getStatusCode(), HttpStatus.UNAUTHORIZED,
                "Login request was restricted due to wrong credentials.");
        assertNotNull(errorBody, "A body is returned.");

        assertEquals(errorBody.getError(), "Unauthorized", "Error is \"Unauthorized\"");
        assertEquals(errorBody.getMessage(), "Unauthorized", "Message is \"Unauthorized\"");
    }

    @Test
    public void testSuccessfullLoginWithCorrectCredentials() {
        ResponseEntity<LoggedInUserResponseDTO> result =
                restTemplate.withBasicAuth("admin", "admin").postForEntity(getDatabaseURL("login"),
                        null, LoggedInUserResponseDTO.class);

        assertEquals(result.getStatusCode(), HttpStatus.OK, "Login was successfull.");
        assertNotNull(result.getBody(), "User is returned.");
        assertEquals(result.getBody().getFirstname(), "admin",
                "Firstname of the returned User is correct.");
        assertEquals(result.getBody().getLastname(), "admin",
                "Username of the returned User is correct.");
    }

    /**
     * Returns a URL to the database with the given path.
     * 
     * @param path Path of the endpoint (without "/")
     * @return URL to the database server pointing to the "/{path}" endpoint.
     */
    private String getDatabaseURL(final String path) {
        return "http://localhost:" + localPort + "/api/" + path;
    }
}
