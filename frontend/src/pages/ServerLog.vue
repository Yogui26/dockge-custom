<template>
    <transition name="slide-fade" appear>
        <div>
            <h1 class="mb-3">{{ $t("serverLog") }} - {{ agentName }}</h1>

            <Terminal v-if="joined" :key="endpoint" class="terminal" :rows="20" mode="displayOnly" name="server-log" :endpoint="endpoint"></Terminal>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            // The terminal is displayed once the server knows about it, so that it can send the history
            joined: false,
        };
    },
    computed: {
        endpoint() {
            return this.$route.params.endpoint || "";
        },
        agentName() {
            const agent = this.$root.agentList?.[this.endpoint];
            return agent?.name || agent?.url || this.$t("currentEndpoint");
        },
    },
    watch: {
        endpoint(newEndpoint, oldEndpoint) {
            this.join(newEndpoint);
        },
    },
    mounted() {
        this.join(this.endpoint);
    },
    methods: {
        join(endpoint) {
            this.joined = false;
            this.$root.emitAgent(endpoint, "joinServerLog", (res) => {
                if (res.ok) {
                    this.joined = true;
                } else {
                    this.$root.toastRes(res);
                }
            });
        },
    },
};
</script>

<style scoped lang="scss">
.terminal {
    height: 410px;
}
</style>
