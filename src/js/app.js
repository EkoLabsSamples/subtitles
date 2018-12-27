import playerOptions from '../config/playerOptions.json';

export default {
    onLoad: function (ctx) { },

    onInit: function (player, ctx) {
        
        // Init the subtitles plugin if not initialized
        if (!player.subtitles) {
            player.initPlugin('subtitles');
        }
        // Set subtitles on
        player.subtitles.visible = true;
        
        // Behind the scenes, eko-cli uses webpack to package our project.
        // The following code uses some webpack trickery. For more info, see:
        // https://webpack.js.org/guides/dependency-management/#require-context
        const SUBTITLES_WEBPACK_REQUIRE_CONTEXT = require.context('../assets/subtitles', false, /^.*\.srt$/);

        // Find all SRT files in 'src/assets/subtitles' (non-recursive).
        // The resulting value will be an array of filenames, for example:
        // ['node_beginning_9936df.en.srt', 'node_beginning_9936df.es.srt', ...]
        const SUBTITLES_FILENAMES =
            SUBTITLES_WEBPACK_REQUIRE_CONTEXT
                .keys()
                .map(filename => filename.substr(2));

        // All our subtitles filenames must adhere to the 
        // following naming convention: [NODE_ID].[LANG_CODE].srt
        const FILENAME_REGEX = /^(.*)\.(.*?)\.srt$/;

        // Iterate over all SRT files
        SUBTITLES_FILENAMES.forEach((filename) => {
            // Parse the node id and language code from filename
            const regexResults = filename.match(FILENAME_REGEX) || [];
            const nodeId = regexResults[1];
            const langCode = regexResults[2];

            // Verify that parsing was successful
            if (!nodeId || !langCode) {
                console.error(`Could not parse SRT filename "${filename}"`);
                return;
            }

            // Verify that node exists in repository
            if (!player.repository.has(nodeId)) {
                console.error(`Can't attach "${filename}": "${nodeId}" missing`);
                return;
            }
            
            // Let's attach the SRT file to the node!
            player.subtitles.attach(nodeId, {
                [langCode]: SUBTITLES_WEBPACK_REQUIRE_CONTEXT(`./${filename}`)
            });
        });

    },

    playerOptions
};
