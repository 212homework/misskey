<template>
<div class="qmfkfnzi _debobigegoItem">
	<a v-if="external" class="main _button _debobigegoPanel _debobigegoClickable" :href="to" target="_blank">
		<span class="icon"><slot name="icon"></slot></span>
		<span class="text"><slot></slot></span>
		<span class="right">
			<span class="text"><slot name="suffix"></slot></span>
			<i class="fas fa-external-link-alt icon"></i>
		</span>
	</a>
	<MkA v-else class="main _button _debobigegoPanel _debobigegoClickable" :class="{ active }" :to="to" :behavior="behavior">
		<span class="icon"><slot name="icon"></slot></span>
		<span class="text"><slot></slot></span>
		<span class="right">
			<span class="text"><slot name="suffix"></slot></span>
			<i class="fas fa-chevron-right icon"></i>
		</span>
	</MkA>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import './debobigego.scss';

export default defineComponent({
	props: {
		to: {
			type: String,
			required: true
		},
		active: {
			type: Boolean,
			required: false
		},
		external: {
			type: Boolean,
			required: false
		},
		behavior: {
			type: String,
			required: false,
		},
	},
	data() {
		return {
		};
	}
});
</script>

<style lang="scss" scoped>
.qmfkfnzi {
	> .main {
		display: flex;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		padding: 14px 16px 14px 14px;

		&:hover {
			text-decoration: none;
		}

		&.active {
			color: var(--accent);
			background: var(--panelHighlight);
		}

		> .icon {
			width: 32px;
			margin-right: 2px;
			flex-shrink: 0;
			text-align: center;
			opacity: 0.8;

			&:empty {
				display: none;

				& + .text {
					padding-left: 4px;
				}
			}
		}

		> .text {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			padding-right: 12px;
		}

		> .right {
			margin-left: auto;
			opacity: 0.7;

			> .text:not(:empty) {
				margin-right: 0.75em;
			}
		}
	}
}
</style>
