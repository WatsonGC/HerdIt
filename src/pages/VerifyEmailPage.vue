<template>
  <q-layout>
    <q-page-container>
      <q-page class="column items-center justify-center q-pa-xl">
        <q-card flat bordered style="width: 420px; max-width: 90vw" class="text-center">
          <q-card-section>
            <q-icon name="mark_email_unread" size="64px" color="warning" class="q-mb-md" />
            <div class="text-h5 q-mb-sm">Verify Your Email</div>
            <p class="text-body1 text-grey">
              A verification link has been sent to <strong>{{ userEmail }}</strong>.
              Please check your inbox and click the link to continue.
            </p>
          </q-card-section>

          <q-card-actions vertical class="q-px-md q-pb-md">
            <q-btn color="primary" label="I've Verified — Continue" :loading="checking" @click="checkVerification" class="q-mb-sm" />
            <q-btn flat label="Resend Verification Email" :loading="resending" @click="resend" :disable="cooldown > 0" />
            <div v-if="cooldown > 0" class="text-caption text-grey q-mt-xs">Resend available in {{ cooldown }}s</div>
            <q-separator class="q-my-sm" />
            <q-btn flat color="negative" label="Sign Out" @click="doSignOut" />
          </q-card-actions>

          <q-card-section v-if="error" class="text-negative q-pt-none">{{ error }}</q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth, currentUser } from 'src/boot/firebase';

export default defineComponent({
  name: 'VerifyEmailPage',

  setup() {
    const router = useRouter();
    const checking = ref(false);
    const resending = ref(false);
    const error = ref('');
    const cooldown = ref(0);
    let cooldownTimer: ReturnType<typeof setInterval> | null = null;

    const userEmail = computed(() => currentUser.value?.email || '');

    function startCooldown() {
      cooldown.value = 60;
      if (cooldownTimer) clearInterval(cooldownTimer);
      cooldownTimer = setInterval(() => {
        cooldown.value--;
        if (cooldown.value <= 0 && cooldownTimer) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
        }
      }, 1000);
    }

    async function checkVerification() {
      checking.value = true;
      error.value = '';
      try {
        await currentUser.value?.reload();
        if (currentUser.value?.emailVerified) {
          await router.push('/');
        } else {
          error.value = 'Email not yet verified. Please check your inbox and click the verification link.';
        }
      } catch (e: unknown) {
        error.value = (e as Error).message;
      } finally {
        checking.value = false;
      }
    }

    async function resend() {
      if (!currentUser.value) return;
      resending.value = true;
      error.value = '';
      try {
        await sendEmailVerification(currentUser.value);
        startCooldown();
      } catch (e: unknown) {
        error.value = (e as Error).message;
      } finally {
        resending.value = false;
      }
    }

    async function doSignOut() {
      await signOut(auth);
      await router.push('/login');
    }

    onUnmounted(() => { if (cooldownTimer) clearInterval(cooldownTimer); });

    return { userEmail, checking, resending, error, cooldown, checkVerification, resend, doSignOut };
  },
});
</script>
