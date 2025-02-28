<template>
<div v-hotkey.global="keymap" v-size="{ min: [800] }" class="eqqrhokj">
	<div v-if="queue > 0" class="new"><button class="_buttonPrimary" @click="top()">{{ $ts.newNoteRecived }}</button></div>
	<div class="tl _block">
		<XTimeline ref="tl" :key="listId"
			class="tl"
			src="list"
			:list="listId"
			:sound="true"
			@before="before()"
			@after="after()"
			@queue="queueUpdated"
		/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed } from 'vue';
import Progress from '@/scripts/loading';
import XTimeline from '@/components/timeline.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import * as symbols from '@/symbols';

export default defineComponent({
	components: {
		XTimeline,
	},

	props: {
		listId: {
			type: String,
			required: true
		}
	},

	data() {
		return {
			list: null,
			queue: 0,
			[symbols.PAGE_INFO]: computed(() => this.list ? {
				title: this.list.name,
				icon: 'fas fa-list-ul',
				bg: 'var(--bg)',
				actions: [{
					icon: 'fas fa-calendar-alt',
					text: this.$ts.jumpToSpecifiedDate,
					handler: this.timetravel
				}, {
					icon: 'fas fa-cog',
					text: this.$ts.settings,
					handler: this.settings
				}],
			} : null),
		};
	},

	computed: {
		keymap(): any {
			return {
				't': this.focus
			};
		},
	},

	watch: {
		listId: {
			async handler() {
				this.list = await os.api('users/lists/show', {
					listId: this.listId
				});
			},
			immediate: true
		}
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		queueUpdated(q) {
			this.queue = q;
		},

		top() {
			scroll(this.$el, { top: 0 });
		},

		settings() {
			this.$router.push(`/my/lists/${this.listId}`);
		},

		async timetravel() {
			const { canceled, result: date } = await os.inputDate({
				title: this.$ts.date,
			});
			if (canceled) return;

			this.$refs.tl.timetravel(date);
		},

		focus() {
			(this.$refs.tl as any).focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.eqqrhokj {
	padding: var(--margin);

	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}

	&.min-width_800px {
		max-width: 800px;
		margin: 0 auto;
	}
}
</style>
