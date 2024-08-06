<template>
    <div v-if="type === 'row'" class="row" style="width: 100%; max-height: 100px">
        <div class="col-1 justify-end">
            <q-img
                :src="props.entry.anime.image"
                style="height: 100%; width: 60px"
                :ratio="9 / 16"></q-img>
        </div>
        <router-link class="col-4" :to="{ path: `/anime/${props.entry.anime.slug}` }">
            {{ props.entry.anime.name }}
        </router-link>
        <div class="col-1">{{ t(`animeListStatuses.${props.entry.status}`) }}</div>
        <div class="col-1">{{ props.entry.rating }}</div>
        <div class="col-2">
            <span>{{ props.entry.watchedEpisodes }}</span>
            <span>/</span>
            <span v-if="props.entry.anime.maxEpisodes">
                {{ props.entry.anime.maxEpisodes }}
            </span>
            <span v-else>?</span>
        </div>
        <div class="col-1">
            {{ t(`mediaTypes.${props.entry.anime.mediaType}`) }}
        </div>
        <div class="col-1">
            <q-checkbox :model-value="props.entry.isFavorite" disable color="teal" />
        </div>
        <div class="col-1">
            <q-btn color="red">X</q-btn>
        </div>
    </div>
    <div v-else>
        <q-img
            :src="props.entry.anime.image"
            style="height: 100%"
            :ratio="9 / 16"
            width="250px"
            fit="cover">
            <div class="absolute-top-right text-subtitle2">
                <q-btn flat :class="{ favorite: props.entry.isFavorite }">
                    <q-icon v-if="props.entry.isFavorite" name="favorite" />
                    <q-icon v-else name="favorite_border" />
                </q-btn>
                <div>
                    {{ props.entry.rating }}
                    <q-icon name="star" />
                </div>
            </div>
            <div class="absolute-top-left text-subtitle2">
                <div>{{ t(`animeListStatuses.${props.entry.status}`) }}</div>
                <div>
                    <span>{{ props.entry.watchedEpisodes }}</span>
                    <span>/</span>
                    <span v-if="props.entry.anime.maxEpisodes">
                        {{ props.entry.anime.maxEpisodes }}
                    </span>
                    <span v-else>?</span>
                </div>
            </div>
            <div class="absolute-bottom text-subtitle1 text-center">
                <router-link class="link" :to="{ path: `/anime/${props.entry.anime.slug}` }">
                    {{ props.entry.anime.name }}
                </router-link>
            </div>
        </q-img>
    </div>
</template>

<script setup lang="ts">
import { defineOptions, PropType, defineProps } from 'vue';
import { WatchListWithAnime } from 'src/components/models';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

defineOptions({
    name: 'WatchListEntry',
});
const props = defineProps({
    entry: {
        type: Object as PropType<WatchListWithAnime>,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});
</script>

<style lang="scss">
.favorite {
    color: red;
}
.link {
    color: white;
    text-decoration: none;
}

.link:hover {
    color: $warning;
}
</style>
