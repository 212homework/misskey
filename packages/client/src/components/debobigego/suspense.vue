<template>
<transition name="fade" mode="out-in">
	<div v-if="pending" class="_debobigegoItem">
		<div class="_debobigegoPanel">
			<MkLoading/>
		</div>
	</div>
	<div v-else-if="resolved" class="_debobigegoItem">
		<slot :result="result"></slot>
	</div>
	<div v-else class="_debobigegoItem">
		<div class="_debobigegoPanel eiurkvay">
			<div><i class="fas fa-exclamation-triangle"></i> {{ $ts.somethingHappened }}</div>
			<MkButton inline class="retry" @click="retry"><i class="fas fa-redo-alt"></i> {{ $ts.retry }}</MkButton>
		</div>
	</div>
</transition>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import './debobigego.scss';
import MkButton from '@/components/ui/button.vue';

export default defineComponent({
	components: {
		MkButton
	},

	props: {
		p: {
			type: Function as PropType<() => Promise<any>>,
			required: true,
		}
	},

	setup(props, context) {
		const pending = ref(true);
		const resolved = ref(false);
		const rejected = ref(false);
		const result = ref(null);

		const process = () => {
			if (props.p == null) {
				return;
			}
			const promise = props.p();
			pending.value = true;
			resolved.value = false;
			rejected.value = false;
			promise.then((_result) => {
				pending.value = false;
				resolved.value = true;
				result.value = _result;
			});
			promise.catch(() => {
				pending.value = false;
				rejected.value = true;
			});
		};

		watch(() => props.p, () => {
			process();
		}, {
			immediate: true
		});

		const retry = () => {
			process();
		};

		return {
			pending,
			resolved,
			rejected,
			result,
			retry,
		};
	}
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.eiurkvay {
	padding: 16px;
	text-align: center;

	> .retry {
		margin-top: 16px;
	}
}
</style>
