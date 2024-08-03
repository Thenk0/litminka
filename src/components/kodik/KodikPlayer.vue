<template>
    <div class="q-video">
        <div class="row">
            <div class="col-3">
                <q-select
                    v-model="currentTranslation"
                    :options="options"
                    options-dense
                    label="Озвучка" />
            </div>

            <div v-if="userStore.isAuth">
                <q-btn v-if="!isFollowed" @click="follow" color="green-6">Подписаться</q-btn>
                <q-btn v-else @click="unfollow" color="red-6">Отписаться</q-btn>
            </div>
        </div>
        <div class="row grid-container">
            <div v-for="i in [...Array(currentTranslation.value.currentEpisodes).keys()]" :key="i">
                <q-btn
                    size="sm"
                    :color="currentEpisode === i + 1 ? 'secondary' : 'primary'"
                    :disable="currentEpisode === i + 1"
                    @click="changeEpisode(i + 1)">
                    {{ i + 1 }}
                </q-btn>
            </div>
        </div>

        <iframe
            :key="currentTranslation.value.id + currentEpisode"
            class="fit size"
            ref="kodik"
            :src="kodikLink"
            frameborder="0"
            allowfullscreen />
        <div>Текущее время {{ episodeElapsed }}</div>
        <div>Просмотрен после {{ watchedAfter }}</div>
        <div>Длина серии {{ episodeLength }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, defineOptions, PropType } from 'vue';
import { Anime, AnimeTranslation } from '../models';
import { onMounted } from 'vue';
import { onUnmounted } from 'vue';
import { useUserStore } from 'src/stores/user-store';

defineOptions({
    name: 'KodikPlayer',
});

const kodik = ref();
const props = defineProps({
    anime: {
        type: Object as PropType<Anime>,
        required: true,
    },
});
const emit = defineEmits<{
    follow: [translation: AnimeTranslation];
    unfollow: [translation: AnimeTranslation];
    episodeWatched: [episode: number];
}>();
const userStore = useUserStore();

const kodikLink = computed(() => {
    return `${currentTranslation.value.value.link}?hide_selectors=true&episode=${currentEpisode.value}`;
});

const translations = computed(() => {
    return props.anime.animeTranslations.map((translation) => {
        return {
            label: translation.group.name,
            value: translation,
            description: translation.group.type,
        };
    });
});
const options = translations;

const followedIds = computed(() => {
    return props.anime.follows?.map((follow) => follow.translation.groupId) ?? [];
});

const isFollowed = computed(() => {
    return followedIds.value.some((id) => id === currentTranslation.value.value.groupId);
});

const currentTranslation = ref({
    label: props.anime.animeTranslations[0].group.name,
    value: props.anime.animeTranslations[0],
    description: props.anime.animeTranslations[0].group.type,
});
const currentEpisode = ref(1);
const episodeLength = ref(0);
const episodeElapsed = ref(0);
let notified = false;

const watchedAfter = computed<number>(() => {
    if (!userStore.isAuth) return Infinity;
    const percent =
        userStore.user.settings.watchListWatchedPercentage * (episodeLength.value / 100);
    return percent;
});

function changeEpisode(episode: number) {
    notified = false;
    currentEpisode.value = episode;
}

function kodikListener(message: MessageEvent) {
    if (!message) return;
    if (typeof message.data.key === 'undefined') return;
    if (message.data.key.includes('kodik')) {
        // todo: fix continue button
        if (message.data.key === 'kodik_player_current_episode') {
            changeEpisode(message.data.value.episode);
        }
        if (message.data.key === 'kodik_player_duration_update') {
            episodeLength.value = message.data.value;
        }
        if (message.data.key === 'kodik_player_time_update') {
            episodeElapsed.value = message.data.value;
            if (episodeElapsed.value >= watchedAfter.value && !notified) {
                emit('episodeWatched', currentEpisode.value);
                notified = true;
            }
        }
    }
}

function follow() {
    emit('follow', currentTranslation.value.value);
}

function unfollow() {
    emit('unfollow', currentTranslation.value.value);
}

onMounted(() => {
    window.addEventListener('message', kodikListener);
});

onUnmounted(() => {
    window.removeEventListener('message', kodikListener);
});
</script>

<style lang="scss">
.q-video {
    width: 75%;
    margin: 0 auto;
}
.size {
    aspect-ratio: 16/9;
}

.grid-container {
    max-height: 400px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(16, 1fr);
}
</style>
