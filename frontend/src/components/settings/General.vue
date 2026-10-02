<template>
    <div>
        <form class="my-4" autocomplete="off" @submit.prevent="saveGeneral">
            <!-- Client side Timezone -->
            <div v-if="false" class="mb-4">
                <label for="timezone" class="form-label">
                    {{ $t("Display Timezone") }}
                </label>
                <select id="timezone" v-model="$root.userTimezone" class="form-select">
                    <option value="auto">
                        {{ $t("Auto") }}: {{ guessTimezone }}
                    </option>
                    <option
                        v-for="(timezone, index) in timezoneList"
                        :key="index"
                        :value="timezone.value"
                    >
                        {{ timezone.name }}
                    </option>
                </select>
            </div>

            <!-- Server Timezone -->
            <div v-if="false" class="mb-4">
                <label for="timezone" class="form-label">
                    {{ $t("Server Timezone") }}
                </label>
                <select id="timezone" v-model="settings.serverTimezone" class="form-select">
                    <option value="UTC">UTC</option>
                    <option
                        v-for="(timezone, index) in timezoneList"
                        :key="index"
                        :value="timezone.value"
                    >
                        {{ timezone.name }}
                    </option>
                </select>
            </div>

            <!-- Primary Hostname -->
            <div class="mb-4">
                <label class="form-label" for="primaryBaseURL">
                    {{ $t("primaryHostname") }}
                </label>

                <div class="input-group mb-3">
                    <input
                        v-model="settings.primaryHostname"
                        class="form-control"
                        :placeholder="$t(`CurrentHostname`)"
                    />
                    <button class="btn btn-outline-primary" type="button" @click="autoGetPrimaryHostname">
                        {{ $t("autoGet") }}
                    </button>
                </div>

                <div class="form-text"></div>
            </div>

            <!-- Save Button -->
            <div>
                <button class="btn btn-primary" type="submit">
                    {{ $t("Save") }}
                </button>
            </div>
        </form>

        <!-- Actions -->
        <h5 class="my-4 settings-subheading">{{ $t("generalActions") }}</h5>

        <div class="mb-4">
            <button class="btn btn-outline-primary mb-2" type="button" @click="scanFolder">
                <font-awesome-icon icon="arrows-rotate" class="me-1" /> {{ $t("scanFolder") }}
            </button>
            <div class="form-text">{{ $t("scanFolderDesc") }}</div>
        </div>

        <div class="mb-4">
            <button class="btn btn-outline-primary mb-2" type="button" :disabled="checkingUpdates" @click="checkUpdates">
                <font-awesome-icon icon="cloud-arrow-down" class="me-1" :class="{ 'fa-beat-fade': checkingUpdates }" /> {{ checkingUpdates ? $t("checkUpdatesRunning") : $t("checkUpdatesNow") }}
            </button>
            <div class="form-text">{{ $t("checkUpdatesDesc") }}</div>
        </div>
    </div>
</template>

<script>

import dayjs from "dayjs";
import { compareVersions } from "compare-versions";
import { timezoneList } from "../../util-frontend";
import { ALL_ENDPOINTS } from "../../../../common/util-common";

// Image checks query every registry, give them time
const CHECK_TIMEOUT_MS = 10 * 60 * 1000;

export default {
    components: {

    },

    data() {
        return {
            timezoneList: timezoneList(),
            checkingUpdates: false,
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
        guessTimezone() {
            return dayjs.tz.guess();
        }
    },

    methods: {
        /** Save the settings */
        saveGeneral() {
            localStorage.timezone = this.$root.userTimezone;
            this.saveSettings();
        },
        /** Ask all the servers to rescan their stacks folder */
        scanFolder() {
            this.$root.emitAgent(ALL_ENDPOINTS, "requestStackList", (res) => {
                this.$root.toastRes(res);
            });
        },

        /**
         * Force the check of the image updates of the stacks (on every online server)
         * and of the new versions of Dockge Custom.
         */
        async checkUpdates() {
            this.checkingUpdates = true;

            const endpoints = Object.keys(this.$root.agentList).filter(endpoint => this.$root.agentStatusList[endpoint] === "online");

            const imageChecks = endpoints.map(endpoint => new Promise((resolve) => {
                const timer = setTimeout(() => resolve({ ok: false,
                    msg: "checkUpdatesTimeout",
                    msgi18n: true }), CHECK_TIMEOUT_MS);
                this.$root.emitAgent(endpoint, "checkImageUpdates", (res) => {
                    clearTimeout(timer);
                    resolve(res);
                });
            }));

            const versionCheck = new Promise((resolve) => {
                this.$root.getSocket().emit("checkVersionNow", resolve);
            });

            const [ version, ...images ] = await Promise.all([ versionCheck, ...imageChecks ]);
            this.checkingUpdates = false;

            const failed = images.filter(res => !res.ok);
            if (failed.length > 0) {
                this.$root.toastRes(failed[0]);
            } else {
                this.$root.toastRes({ ok: true,
                    msg: "imageUpdatesChecked",
                    msgi18n: true });
            }

            if (!version.ok) {
                this.$root.toastRes(version);
            } else if (version.latestVersion && compareVersions(version.latestVersion, this.$root.info.version) >= 1) {
                this.$root.toastRes({
                    ok: true,
                    msg: { key: "newVersionAvailable",
                        values: { version: version.latestVersion } },
                    msgi18n: true,
                });
            } else {
                this.$root.toastRes({ ok: true,
                    msg: "versionUpToDate",
                    msgi18n: true });
            }
        },

        /** Get the base URL of the application */
        autoGetPrimaryHostname() {
            this.settings.primaryHostname = location.hostname;
        },
    },
};
</script>

