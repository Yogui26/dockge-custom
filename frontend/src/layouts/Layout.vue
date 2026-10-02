<template>
    <div :class="classes">
        <div v-if="! $root.socketIO.connected && ! $root.socketIO.firstConnect" class="lost-connection">
            <div class="container-fluid">
                {{ $root.socketIO.connectionErrorMsg }}
                <div v-if="$root.socketIO.showReverseProxyGuide">
                    {{ $t("reverseProxyMsg1") }} <a href="https://github.com/louislam/uptime-kuma/wiki/Reverse-Proxy" target="_blank">{{ $t("reverseProxyMsg2") }}</a>
                </div>
            </div>
        </div>

        <!-- Desktop header -->
        <header class="d-flex flex-nowrap align-items-center py-3 mb-3 border-bottom">
            <div class="d-flex align-items-center ms-4 me-3">
                <router-link to="/" class="d-flex align-items-center text-dark text-decoration-none">
                    <img src="/icon.svg" class="me-2" width="40" height="40" />
                    <!--object class="bi me-2" width="40" height="40" data="/icon.svg" /-->
                    <span class="d-none d-md-inline fs-4 title">Dockge</span>
                </router-link>

                <a v-if="hasNewVersion" target="_blank" href="https://github.com/Yogui26/dockge-custom/releases" class="ms-2 me-3">
                    <font-awesome-icon icon="arrow-up" class="notification-icon" />
                </a>
            </div>

            <ul class="d-flex flex-nowrap ms-auto nav nav-pills">
                <li v-if="$root.loggedIn" class="nav-item me-2">
                    <router-link to="/" class="nav-link d-flex flex-column flex-sm-row align-items-center" data-toggle="tooltip" :title="$t('home')">
                        <font-awesome-icon icon="home" />
                        <div class="mt-2 mt-sm-0 ms-sm-2">{{ $t("home") }}</div>
                    </router-link>
                </li>

                <li v-if="$root.loggedIn && $root.isMobile" class="nav-item me-2" data-toggle="tooltip" :title="$tc('stack', 2)">
                    <router-link to="/stacks" class="nav-link d-flex flex-column flex-sm-row align-items-center">
                        <font-awesome-icon icon="list" />
                        <div class="mt-2 mt-sm-0 ms-sm-2">{{ $tc("stack", 2) }}</div>
                    </router-link>
                </li>

                <li v-if="$root.loggedIn" class="nav-item" data-toggle="tooltip" :title="$t('Settings')">
                    <router-link to="/settings" class="nav-link d-flex flex-column flex-sm-row align-items-center">
                        <font-awesome-icon icon="cog" />
                        <div class="mt-2 mt-sm-0 ms-sm-2">{{ $t("Settings") }}</div>
                    </router-link>
                </li>
            </ul>
        </header>

        <main>
            <div v-if="$root.socketIO.connecting" class="container mt-5">
                <h4>{{ $t("connecting...") }}</h4>
            </div>

            <router-view v-if="$root.loggedIn" />
            <Login v-if="! $root.loggedIn && $root.allowLoginDialog" />
        </main>
    </div>
</template>

<script>
import Login from "../components/Login.vue";
import { compareVersions } from "compare-versions";

export default {

    components: {
        Login,
    },

    data() {
        return {

        };
    },

    computed: {

        // Theme or Mobile
        classes() {
            const classes = {};
            classes[this.$root.theme] = true;
            classes["mobile"] = this.$root.isMobile;
            return classes;
        },

        hasNewVersion() {
            if (this.$root.info.latestVersion && this.$root.info.version) {
                return compareVersions(this.$root.info.latestVersion, this.$root.info.version) >= 1;
            } else {
                return false;
            }
        },

    },

    watch: {

    },

    mounted() {

    },

    beforeUnmount() {

    },

    methods: {

    },

};
</script>

<style lang="scss" scoped>
@import "../styles/vars.scss";

.nav-link {
    &.status-page {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.bottom-nav {
    z-index: 1000;
    position: fixed;
    bottom: 0;
    height: calc(60px + env(safe-area-inset-bottom));
    width: 100%;
    left: 0;
    background-color: #fff;
    box-shadow: 0 15px 47px 0 rgba(0, 0, 0, 0.05), 0 5px 14px 0 rgba(0, 0, 0, 0.05);
    text-align: center;
    white-space: nowrap;
    padding: 0 10px env(safe-area-inset-bottom);

    a {
        text-align: center;
        width: 25%;
        display: inline-block;
        height: 100%;
        padding: 8px 10px 0;
        font-size: 13px;
        color: #c1c1c1;
        overflow: hidden;
        text-decoration: none;

        &.router-link-exact-active, &.active {
            color: $primary;
            font-weight: bold;
        }

        div {
            font-size: 20px;
        }
    }
}

main {
    min-height: calc(100vh - 160px);
}

.title {
    font-weight: bold;
}

.nav {
    margin-right: 25px;
}

.lost-connection {
    padding: 5px;
    background-color: crimson;
    color: white;
    position: fixed;
    width: 100%;
    z-index: 99999;
}

.dark {
    header {
        background-color: $dark-header-bg;
        border-bottom-color: $dark-header-bg !important;

        span {
            color: #f0f6fc;
        }
    }

    .bottom-nav {
        background-color: $dark-bg;
    }
}

.notification-icon {
    color: $info;
    font-weight: bold;
}
</style>
