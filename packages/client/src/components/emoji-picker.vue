<template>
<div class="omfetrab" :class="['w' + width, 'h' + height, { big, asDrawer }]" :style="{ maxHeight: maxHeight ? maxHeight + 'px' : null }">
	<input ref="search" v-model.trim="q" class="search" data-prevent-emoji-insert :class="{ filled: q != null && q != '' }" :placeholder="$ts.search" @paste.stop="paste" @keyup.enter="done()">
	<div ref="emojis" class="emojis">
		<section class="result">
			<div v-if="searchResultCustom.length > 0">
				<button v-for="emoji in searchResultCustom"
					:key="emoji"
					class="_button"
					:title="emoji.name"
					tabindex="0"
					@click="chosen(emoji, $event)"
				>
					<MkEmoji v-if="emoji.char != null" :emoji="emoji.char"/>
					<img v-else :src="$store.state.disableShowingAnimatedImages ? getStaticImageUrl(emoji.url) : emoji.url"/>
				</button>
			</div>
			<div v-if="searchResultUnicode.length > 0">
				<button v-for="emoji in searchResultUnicode"
					:key="emoji.name"
					class="_button"
					:title="emoji.name"
					tabindex="0"
					@click="chosen(emoji, $event)"
				>
					<MkEmoji :emoji="emoji.char"/>
				</button>
			</div>
		</section>

		<div v-if="tab === 'index'" class="index">
			<section v-if="showPinned">
				<div>
					<button v-for="emoji in pinned"
						:key="emoji"
						class="_button"
						tabindex="0"
						@click="chosen(emoji, $event)"
					>
						<MkEmoji :emoji="emoji" :normal="true"/>
					</button>
				</div>
			</section>

			<section>
				<header class="_acrylic"><i class="far fa-clock fa-fw"></i> {{ $ts.recentUsed }}</header>
				<div>
					<button v-for="emoji in $store.state.recentlyUsedEmojis"
						:key="emoji"
						class="_button"
						@click="chosen(emoji, $event)"
					>
						<MkEmoji :emoji="emoji" :normal="true"/>
					</button>
				</div>
			</section>
		</div>
		<div>
			<header class="_acrylic">{{ $ts.customEmojis }}</header>
			<XSection v-for="category in customEmojiCategories" :key="'custom:' + category" :initial-shown="false" :emojis="customEmojis.filter(e => e.category === category).map(e => ':' + e.name + ':')">{{ category || $ts.other }}</XSection>
		</div>
		<div>
			<header class="_acrylic">{{ $ts.emoji }}</header>
			<XSection v-for="category in categories" :emojis="emojilist.filter(e => e.category === category).map(e => e.char)">{{ category }}</XSection>
		</div>
	</div>
	<div class="tabs">
		<button class="_button tab" :class="{ active: tab === 'index' }" @click="tab = 'index'"><i class="fas fa-asterisk fa-fw"></i></button>
		<button class="_button tab" :class="{ active: tab === 'custom' }" @click="tab = 'custom'"><i class="fas fa-laugh fa-fw"></i></button>
		<button class="_button tab" :class="{ active: tab === 'unicode' }" @click="tab = 'unicode'"><i class="fas fa-leaf fa-fw"></i></button>
		<button class="_button tab" :class="{ active: tab === 'tags' }" @click="tab = 'tags'"><i class="fas fa-hashtag fa-fw"></i></button>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { emojilist } from '@/scripts/emojilist';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import Particle from '@/components/particle.vue';
import * as os from '@/os';
import { isTouchUsing } from '@/scripts/touch';
import { isMobile } from '@/scripts/is-mobile';
import { emojiCategories } from '@/instance';
import XSection from './emoji-picker.section.vue';

export default defineComponent({
	components: {
		XSection
	},

	props: {
		showPinned: {
			required: false,
			default: true,
		},
		asReactionPicker: {
			required: false,
		},
		maxHeight: {
			type: Number,
			required: false,
		},
		asDrawer: {
			type: Boolean,
			required: false
		},
	},

	emits: ['chosen'],

	data() {
		return {
			emojilist: markRaw(emojilist),
			getStaticImageUrl,
			pinned: this.$store.reactiveState.reactions,
			width: this.asReactionPicker ? this.$store.state.reactionPickerWidth : 3,
			height: this.asReactionPicker ? this.$store.state.reactionPickerHeight : 2,
			big: this.asReactionPicker ? isTouchUsing : false,
			customEmojiCategories: emojiCategories,
			customEmojis: this.$instance.emojis,
			q: null,
			searchResultCustom: [],
			searchResultUnicode: [],
			tab: 'index',
			categories: ['face', 'people', 'animals_and_nature', 'food_and_drink', 'activity', 'travel_and_places', 'objects', 'symbols', 'flags'],
		};
	},

	watch: {
		q() {
			this.$refs.emojis.scrollTop = 0;

			if (this.q == null || this.q === '') {
				this.searchResultCustom = [];
				this.searchResultUnicode = [];
				return;
			}

			const q = this.q.replace(/:/g, '');

			const searchCustom = () => {
				const max = 8;
				const emojis = this.customEmojis;
				const matches = new Set();

				const exactMatch = emojis.find(e => e.name === q);
				if (exactMatch) matches.add(exactMatch);

				if (q.includes(' ')) { // AND検索
					const keywords = q.split(' ');

					// 名前にキーワードが含まれている
					for (const emoji of emojis) {
						if (keywords.every(keyword => emoji.name.includes(keyword))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					// 名前またはエイリアスにキーワードが含まれている
					for (const emoji of emojis) {
						if (keywords.every(keyword => emoji.name.includes(keyword) || emoji.aliases.some(alias => alias.includes(keyword)))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
				} else {
					for (const emoji of emojis) {
						if (emoji.name.startsWith(q)) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.aliases.some(alias => alias.startsWith(q))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.name.includes(q)) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.aliases.some(alias => alias.includes(q))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
				}

				return matches;
			};

			const searchUnicode = () => {
				const max = 8;
				const emojis = this.emojilist;
				const matches = new Set();

				const exactMatch = emojis.find(e => e.name === q);
				if (exactMatch) matches.add(exactMatch);

				if (q.includes(' ')) { // AND検索
					const keywords = q.split(' ');

					// 名前にキーワードが含まれている
					for (const emoji of emojis) {
						if (keywords.every(keyword => emoji.name.includes(keyword))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					// 名前またはエイリアスにキーワードが含まれている
					for (const emoji of emojis) {
						if (keywords.every(keyword => emoji.name.includes(keyword) || emoji.keywords.some(alias => alias.includes(keyword)))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
				} else {
					for (const emoji of emojis) {
						if (emoji.name.startsWith(q)) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.keywords.some(keyword => keyword.startsWith(q))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.name.includes(q)) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
					if (matches.size >= max) return matches;

					for (const emoji of emojis) {
						if (emoji.keywords.some(keyword => keyword.includes(q))) {
							matches.add(emoji);
							if (matches.size >= max) break;
						}
					}
				}

				return matches;
			};

			this.searchResultCustom = Array.from(searchCustom());
			this.searchResultUnicode = Array.from(searchUnicode());
		}
	},

	mounted() {
		this.focus();
	},

	methods: {
		focus() {
			if (!isMobile && !isTouchUsing) {
				this.$refs.search.focus({
					preventScroll: true
				});
			}
		},

		reset() {
			this.$refs.emojis.scrollTop = 0;
			this.q = '';
		},

		getKey(emoji: any) {
			return typeof emoji === 'string' ? emoji : (emoji.char || `:${emoji.name}:`);
		},

		chosen(emoji: any, ev) {
			if (ev) {
				const el = ev.currentTarget || ev.target;
				const rect = el.getBoundingClientRect();
				const x = rect.left + (el.clientWidth / 2);
				const y = rect.top + (el.clientHeight / 2);
				os.popup(Particle, { x, y }, {}, 'end');
			}

			const key = this.getKey(emoji);
			this.$emit('chosen', key);

			// 最近使った絵文字更新
			if (!this.pinned.includes(key)) {
				let recents = this.$store.state.recentlyUsedEmojis;
				recents = recents.filter((e: any) => e !== key);
				recents.unshift(key);
				this.$store.set('recentlyUsedEmojis', recents.splice(0, 32));
			}
		},

		paste(event) {
			const paste = (event.clipboardData || window.clipboardData).getData('text');
			if (this.done(paste)) {
				event.preventDefault();
			}
		},

		done(query) {
			if (query == null) query = this.q;
			if (query == null) return;
			const q = query.replace(/:/g, '');
			const exactMatchCustom = this.customEmojis.find(e => e.name === q);
			if (exactMatchCustom) {
				this.chosen(exactMatchCustom);
				return true;
			}
			const exactMatchUnicode = this.emojilist.find(e => e.char === q || e.name === q);
			if (exactMatchUnicode) {
				this.chosen(exactMatchUnicode);
				return true;
			}
			if (this.searchResultCustom.length > 0) {
				this.chosen(this.searchResultCustom[0]);
				return true;
			}
			if (this.searchResultUnicode.length > 0) {
				this.chosen(this.searchResultUnicode[0]);
				return true;
			}
		},
	}
});
</script>

<style lang="scss" scoped>
.omfetrab {
	$pad: 8px;
	--eachSize: 40px;

	display: flex;
	flex-direction: column;

	&.big {
		--eachSize: 44px;
	}

	&.w1 {
		width: calc((var(--eachSize) * 5) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr;
	}

	&.w2 {
		width: calc((var(--eachSize) * 6) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.w3 {
		width: calc((var(--eachSize) * 7) + (#{$pad} * 2));
		--columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	&.h1 {
		height: calc((var(--eachSize) * 4) + (#{$pad} * 2));
	}

	&.h2 {
		height: calc((var(--eachSize) * 6) + (#{$pad} * 2));
	}

	&.h3 {
		height: calc((var(--eachSize) * 8) + (#{$pad} * 2));
	}

	&.asDrawer {
		width: 100% !important;

		> .emojis {
			::v-deep(section) {
				> header {
					height: 32px;
					line-height: 32px;
					padding: 0 12px;
					font-size: 15px;
				}

				> div {
					display: grid;
					grid-template-columns: var(--columns);

					> button {
						aspect-ratio: 1 / 1;
						width: auto;
						height: auto;
						min-width: 0;

						> * {
							font-size: 30px;
						}
					}
				}
			}
		}
	}

	> .search {
		width: 100%;
		padding: 12px;
		box-sizing: border-box;
		font-size: 1em;
		outline: none;
		border: none;
		background: transparent;
		color: var(--fg);

		&:not(.filled) {
			order: 1;
			z-index: 2;
			box-shadow: 0px -1px 0 0px var(--divider);
		}
	}

	> .tabs {
		display: flex;
		display: none;

		> .tab {
			flex: 1;
			height: 38px;
			border-top: solid 0.5px var(--divider);

			&.active {
				border-top: solid 1px var(--accent);
				color: var(--accent);
			}
		}
	}

	> .emojis {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;

		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}

		> div {
			&:not(.index) {
				padding: 4px 0 8px 0;
				border-top: solid 0.5px var(--divider);
			}

			> header {
				/*position: sticky;
				top: 0;
				left: 0;*/
				height: 32px;
				line-height: 32px;
				z-index: 2;
				padding: 0 8px;
				font-size: 12px;
			}
		}

		::v-deep(section) {
			> header {
				position: sticky;
				top: 0;
				left: 0;
				height: 32px;
				line-height: 32px;
				z-index: 1;
				padding: 0 8px;
				font-size: 12px;
				cursor: pointer;

				&:hover {
					color: var(--accent);
				}
			}

			> div {
				position: relative;
				padding: $pad;

				> button {
					position: relative;
					padding: 0;
					width: var(--eachSize);
					height: var(--eachSize);
					border-radius: 4px;

					&:focus-visible {
						outline: solid 2px var(--focus);
						z-index: 1;
					}

					&:hover {
						background: rgba(0, 0, 0, 0.05);
					}

					&:active {
						background: var(--accent);
						box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, 0.15);
					}

					> * {
						font-size: 24px;
						height: 1.25em;
						vertical-align: -.25em;
						pointer-events: none;
					}
				}
			}

			&.result {
				border-bottom: solid 0.5px var(--divider);

				&:empty {
					display: none;
				}
			}
		}
	}
}
</style>
