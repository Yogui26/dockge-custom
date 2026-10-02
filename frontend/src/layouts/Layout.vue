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
            </div>

            <ul class="d-flex flex-nowrap ms-auto nav nav-pills">
                <li v-if="$root.loggedIn" class="nav-item me-2">
                    <router-link to="/" class="nav-link d-flex align-items-center" data-toggle="tooltip" :title="$t('home')" :aria-label="$t('home')">
                        <font-awesome-icon icon="home" />
                        <div class="d-none d-md-block ms-md-2">{{ $t("home") }}</div>
                    </router-link>
                </li>

                <li v-if="$root.loggedIn && $root.isMobile" class="nav-item me-2" data-toggle="tooltip" :title="$tc('stack', 2)">
                    <router-link to="/stacks" class="nav-link d-flex align-items-center" :aria-label="$tc('stack', 2)">
                        <font-awesome-icon icon="list" />
                        <div class="d-none d-md-block ms-md-2">{{ $tc("stack", 2) }}</div>
                    </router-link>
                </li>

                <li v-if="$root.loggedIn" class="nav-item" data-toggle="tooltip" :title="$t('Settings')">
                    <router-link to="/settings" class="nav-link d-flex align-items-center" :aria-label="$t('Settings')">
                        <font-awesome-icon icon="cog" />
                        <div class="d-none d-md-block ms-md-2">{{ $t("Settings") }}</div>
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

// Screens reachable with a horizontal swipe on mobile, in the order of the header buttons
const SWIPE_SCREENS = [ "/", "/stacks", "/settings" ];
const SWIPE_MIN_DISTANCE = 70;

export default {

    components: {
        Login,
    },

    data() {
        return {
            swipeStart: null,
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

    },

    watch: {

    },

    mounted() {
        document.addEventListener("touchstart", this.onTouchStart, { passive: true });
        document.addEventListener("touchend", this.onTouchEnd, { passive: true });
    },

    beforeUnmount() {
        document.removeEventListener("touchstart", this.onTouchStart);
        document.removeEventListener("touchend", this.onTouchEnd);
    },

    methods: {
        /**
         * Index of the current screen among the screens reachable with a swipe.
         * Pages with unsaved work (compose editor...) are not part of it, so a swipe there does nothing.
         * @returns {number} Index in SWIPE_SCREENS, -1 if the current page is not a swipe screen
         */
        swipeScreenIndex() {
            const path = this.$route.path;
            if (path === "/") {
                return 0;
            }
            if (path === "/stacks") {
                return 1;
            }
            if (path === "/settings" || path.startsWith("/settings/")) {
                return 2;
            }
            return -1;
        },

        /**
         * Is the touch started on something that already uses horizontal gestures?
         * @param {Element} element Element where the touch started
         * @returns {boolean} true if a swipe must be ignored
         */
        isSwipeBlocked(element) {
            if (!(element instanceof Element)) {
                return true;
            }

            // Text fields, terminals, editors, sliders, modals and dropdowns
            if (element.closest("input, textarea, select, .xterm, .cm-editor, .modal, .dropdown-menu, [data-no-swipe]")) {
                return true;
            }

            // Anything scrollable horizontally (wide tables...)
            for (let el = element; el && el !== document.body; el = el.parentElement) {
                const overflowX = getComputedStyle(el).overflowX;
                if ((overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) {
                    return true;
                }
            }

            return false;
        },

        onTouchStart(e) {
            if (e.touches.length !== 1 || !this.$root.isMobile || !this.$root.loggedIn) {
                this.swipeStart = null;
                return;
            }

            const touch = e.touches[0];
            this.swipeStart = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
                blocked: this.isSwipeBlocked(e.target),
            };
        },

        onTouchEnd(e) {
            const start = this.swipeStart;
            this.swipeStart = null;

            if (!start || start.blocked || e.changedTouches.length !== 1) {
                return;
            }

            const touch = e.changedTouches[0];
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;

            // A quick, mostly horizontal and long enough move
            if (Date.now() - start.time > 600 || Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * 0.5) {
                return;
            }

            const index = this.swipeScreenIndex();
            if (index < 0) {
                return;
            }

            // Swipe to the left: next screen, to the right: previous screen
            const target = SWIPE_SCREENS[index + (dx < 0 ? 1 : -1)];
            if (target) {
                this.$router.push(target);
            }
        },
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
