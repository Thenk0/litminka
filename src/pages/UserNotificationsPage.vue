<template>
    <q-page padding>
        <div class="q-pa-md">
            <q-btn @click="readNotifications" color="primary">Прочитать</q-btn>
            <q-table
                flat
                style="height: max-content; width: 50%; margin: 0 auto"
                class="table"
                title="Уведомления"
                :rows="$store.notifications"
                :columns="columns"
                row-key="name"
                virtual-scroll
                hide-bottom
                v-model:pagination="pagination"
                :rows-per-page-options="[0]">
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="index" :props="props">
                            <q-checkbox
                                v-if="!props.row.isRead"
                                v-model="selection"
                                :val="props.row.id"
                                color="teal" />
                        </q-td>
                        <q-td key="index" :props="props">
                            {{ props.row.id }}
                        </q-td>
                        <q-td key="index" :props="props">
                            <q-badge
                                v-if="!props.row.isRead"
                                color="red"
                                floating
                                transparent></q-badge>
                            <q-img width="100px" :src="props.row.anime.image"></q-img>
                        </q-td>
                        <q-td key="name" :props="props">
                            <router-link :to="{ path: `/anime/${props.row.anime.slug}` }">
                                {{ props.row.anime.name }}
                            </router-link>
                        </q-td>
                        <q-td key="status" :props="props">
                            {{ t(`notificationStatuses.${props.row.status}`) }}
                        </q-td>
                        <q-td key="group" :props="props">
                            {{ props.row.group.name }}
                        </q-td>
                        <q-td key="episode" :props="props">
                            {{ props.row.episode }}
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import { useUserNotificationStore } from 'src/stores/user-notification-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({
    name: 'WatchList',
    async preFetch({ store }) {
        const $store = useUserNotificationStore(store);
        await $store.getNotifications();
    },
});

const { t } = useI18n();

const pagination = ref({ rowsPerPage: 0 });
const columns: QTableColumn[] = [
    { name: 'checkbox', label: '', field: 'checkbox' },
    { name: 'index', label: '#', field: 'index' },
    { name: 'image', label: 'Постер', field: 'image', align: 'right' },
    { name: 'name', label: 'Название', field: 'name', align: 'left' },
    { name: 'status', label: 'Статус', field: 'status' },
    { name: 'group', label: 'Группа', field: 'group' },
    { name: 'episode', label: 'Серия', field: 'episode' },
];

const $store = useUserNotificationStore();
const selection = ref<number[]>([]);
async function readNotifications() {
    const selections = selection.value;
    $store.unreadNotifications -= selection.value.length;

    $store.notifications = $store.notifications.map((notifaction) => {
        if (!selections.includes(notifaction.id)) return notifaction;
        notifaction.isRead = true;
        return notifaction;
    });
    await $store.readNotifications(selections);

    selection.value = [];
}
</script>
