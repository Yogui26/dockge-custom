<template>
    <div class="d-flex justify-content-center align-items-center">
        <div class="logo d-flex flex-column justify-content-center align-items-center">
            <img class="my-4 about-logo" width="200" height="200" :src="logoSrc" alt="Yogui26" @error="useFallbackLogo" />
            <div class="fs-4 fw-bold">Dockge Custom</div>
            <div>{{ $t("Version") }}: {{ $root.info.version }}</div>
            <div class="frontend-version">{{ $t("Frontend Version") }}: {{ $root.frontendVersion }}</div>

            <div v-if="!$root.isFrontendBackendVersionMatched" class="alert alert-warning mt-4" role="alert">
                ⚠️ {{ $t("Frontend Version do not match backend version!") }}
            </div>

            <div class="my-3 update-link"><a href="https://github.com/Yogui26/dockge-custom/releases" target="_blank" rel="noopener noreferrer">{{ $t("Check Update On GitHub") }}</a></div>

            <div class="mt-1">
                <div class="form-check">
                    <label><input v-model="settings.checkUpdate" type="checkbox" @change="saveSettings()" /> {{ $t("Show update if available") }}</label>
                </div>

                <div class="form-check">
                    <label><input v-model="settings.checkBeta" type="checkbox" :disabled="!settings.checkUpdate" @change="saveSettings()" /> {{ $t("Also check beta release") }}</label>
                </div>
            </div>

            <div class="fork-info mt-4 text-center">
                <i18n-t keypath="aboutForkMsg" tag="p" class="mb-2">
                    <template #hamphh>
                        <a href="https://github.com/hamphh/dockge" target="_blank" rel="noopener noreferrer">hamphh/dockge</a>
                    </template>
                    <template #louislam>
                        <a href="https://github.com/louislam/dockge" target="_blank" rel="noopener noreferrer">louislam/dockge</a>
                    </template>
                </i18n-t>

                <ul class="list-unstyled mb-2">
                    <li><a href="https://github.com/Yogui26/dockge-custom" target="_blank" rel="noopener noreferrer">Yogui26/dockge-custom</a> <span class="text-muted">({{ $t("aboutThisFork") }})</span></li>
                    <li><a href="https://github.com/hamphh/dockge" target="_blank" rel="noopener noreferrer">hamphh/dockge</a> <span class="text-muted">({{ $t("aboutFirstFork") }})</span></li>
                    <li><a href="https://github.com/louislam/dockge" target="_blank" rel="noopener noreferrer">louislam/dockge</a> <span class="text-muted">({{ $t("aboutOriginalProject") }})</span></li>
                </ul>

                <div class="license">{{ $t("aboutLicenseMsg") }}</div>
            </div>
        </div>
    </div>
</template>

<script>
const LOGO_PATH = "/yogui26.jpg";
const FALLBACK_LOGO_PATH = "/icon.svg";

export default {
    data() {
        return {
            logoSrc: LOGO_PATH,
        };
    },

    computed: {
        settings() {
            return this.$parent.$parent.$parent.settings;
        },
        saveSettings() {
            return this.$parent.$parent.$parent.saveSettings;
        },
        settingsLoaded() {
            return this.$parent.$parent.$parent.settingsLoaded;
        },
    },

    watch: {

    },

    methods: {
        /**
         * Use the default Dockge logo if the profile picture is not available.
         * @returns {void}
         */
        useFallbackLogo() {
            if (this.logoSrc !== FALLBACK_LOGO_PATH) {
                this.logoSrc = FALLBACK_LOGO_PATH;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.logo {
    margin: 4em 1em;
}

.about-logo {
    border-radius: 50%;
    object-fit: cover;
}

.update-link {
    font-size: 0.8em;
}

.fork-info {
    max-width: 32em;
    font-size: 0.9em;
}

.license {
    font-size: 0.8em;
    opacity: 0.7;
}

.frontend-version {
    font-size: 0.9em;
    color: #cccccc;

    .dark & {
        color: #333333;
    }
}

</style>
