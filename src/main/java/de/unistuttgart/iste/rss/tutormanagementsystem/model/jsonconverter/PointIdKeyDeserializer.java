package de.unistuttgart.iste.rss.tutormanagementsystem.model.jsonconverter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.KeyDeserializer;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;

/**
 * PointIdDeserializer
 */
public class PointIdKeyDeserializer extends KeyDeserializer {

    @Override
    public PointId deserializeKey(final String key, final DeserializationContext ctxt)
            throws IOException {
        final Pattern regex = Pattern.compile(".*::(.+)--.*::(.+)");
        final Matcher matcher = regex.matcher(key);

        if (matcher.find() && matcher.groupCount() != 2) {
            return new PointId(UUID.fromString(matcher.group(1)),
                    Integer.parseInt(matcher.group(2)));
        }

        throw new IllegalArgumentException("The given key (" + key
                + ") does not match the pattern of the string represantation of a PointId.");
    }
}
