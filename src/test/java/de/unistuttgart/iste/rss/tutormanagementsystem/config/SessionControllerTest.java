package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * SessionControllerTest
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
public class SessionControllerTest {

    private TestRestTemplate testRestTemplate;
    private TestRestTemplate testRestTemplateWithAuth;

    @LocalServerPort
    private int localPort;

    @BeforeEach
    public void setupTest() {
        testRestTemplate = new TestRestTemplate();
        testRestTemplateWithAuth = new TestRestTemplate("admin", "admin");
    }

    @Test
    public void testUnauthenticatedCantAccess() {
        ResponseEntity<String> response =
                testRestTemplate.getForEntity(getDatabaseURL("user"), String.class);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void testAuthenticateForSession() {
        ResponseEntity<Object> response =
                testRestTemplateWithAuth.getForEntity(getDatabaseURL("user"), Object.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        String sessionCookie = response.getHeaders().get("Set-Cookie").get(0).split(";")[0];

        assertNotNull(sessionCookie, "A session cookie got returned.");
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
