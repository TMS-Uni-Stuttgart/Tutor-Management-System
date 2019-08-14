package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * LanguageController
 */
@RestController
@RequestMapping(path = "/api/locales/{lang}/{namespace}",
        consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public class LanguageController {

    private final Logger logger = LoggerFactory.getLogger(LanguageController.class);

    @PostMapping
    public void addMissingLanguageKey(final @PathVariable String lang,
            final @PathVariable String namespace,
            final @RequestBody MultiValueMap<String, String> params) {

        List<String> keys = new ArrayList<>();
        logger.info(String.format("Missing language key detected for lang %s in namespace %s", lang,
                namespace));

        params.forEach((key, list) -> {
            if (!key.equals("_t")) {
                // Only add the key if it is NOT the timestamp.
                keys.add(key);
            }
        });

        Path root = Paths.get("").toAbsolutePath();
        Path path = Paths.get(root.toString(),
                String.format("/missing_locales/%s/%s.json", lang, namespace));

        try {
            if (!Files.exists(path)) {
                Files.createDirectories(path.getParent());
                Files.createFile(path);
            }

            if (!Files.isReadable(path)) {
                logger.error(String.format("Cannot read from file %s.", path.toString()));
                return;
            }

            if (!Files.isWritable(path)) {
                logger.error(String.format("Cannot write to file %s.", path.toString()));
                return;
            }

            String contents = Files.readString(path);
            ObjectMapper objMapper = new ObjectMapper();
            Map<String, String> missingKeys =
                    objMapper.readValue(contents, new TypeReference<Map<String, String>>() {});

            objMapper.enable(SerializationFeature.INDENT_OUTPUT,
                    SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);

            for (var key : keys) {
                if (!missingKeys.containsKey(key)) {
                    missingKeys.put(key, key);
                }
            }

            Files.writeString(path, objMapper.writeValueAsString(missingKeys));

        } catch (IOException e) {
            e.getMessage();
        }
    }
}
