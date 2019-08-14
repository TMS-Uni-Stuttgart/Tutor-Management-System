package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.config.EnvironmentVariable;

/**
 * EnvironmentService
 */
@Service
public class EnvironmentService {

    private List<EnvironmentVariable> requiredKeys =
            Arrays.asList(EnvironmentVariable.TMS_DB_ENCRYPTION_KEY,
                    EnvironmentVariable.TMS_SERVER_INITIAL_ADMIN_PASSWORD);

    @Autowired
    private Environment env;

    public List<String> checkAvailabilityOfAllRequiredVariables() throws IllegalStateException {
        final List<String> notSetKeys = new ArrayList<>();

        for (var key : requiredKeys) {
            final String value = env.getProperty(key.toString());

            if (value == null) {
                notSetKeys.add(key.toString());
            }
        }

        return notSetKeys;
    }

    public String getProperty(final EnvironmentVariable key) throws IllegalStateException {
        final String property = env.getProperty(key.toString());

        if (property == null) {
            throw new IllegalStateException(
                    "The required environment variable \"" + key + "\" is not set.");
        }

        return property;
    }

    public String getProperty(final EnvironmentVariable key, final String defaultValue) {
        final String property = env.getProperty(key.toString());

        if (property == null) {
            return defaultValue;
        }

        return property;
    }
}
