package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * TestConfiguration
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
public abstract class TestConfiguration {

    @LocalServerPort
    private int localPort;

    protected static TestRestTemplate restTemplate;

    @BeforeAll
    public static void setup() {
        restTemplate = new TestRestTemplate("admin", "admin");

        restTemplate.getRestTemplate()
                .setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    /**
     * Returns a URL to the database with the given path.
     * 
     * @param path Path of the endpoint (without "/")
     * @return URL to the database server pointing to the "/{path}" endpoint.
     */
    protected String getDatabaseURL(final String path) {
        return "http://localhost:" + localPort + "/api/" + path;
    }
}
