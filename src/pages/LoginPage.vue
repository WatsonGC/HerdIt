<template>
  <q-layout>
    <q-page-container>
      <q-page class="column items-center justify-center q-pa-xl">
        <q-icon name="fa-solid fa-cow" size="64px" color="brown" class="q-mb-md" />
        <h4 class="q-mb-lg">HerdIt</h4>
        <p class="text-subtitle1 text-grey q-mb-lg">Manage your herd, grow your legacy</p>

        <q-card flat bordered style="width: 360px; max-width: 90vw">
          <q-card-section>
            <q-input
              v-model="email"
              label="Email"
              type="email"
              outlined
              class="q-mb-md"
              @keyup.enter="signIn"
            />
            <q-input
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              @keyup.enter="signIn"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </q-card-section>

          <q-card-section v-if="error" class="text-negative q-pt-none">
            {{ error }}
          </q-card-section>

          <q-card-actions vertical class="q-px-md q-pb-md">
            <q-btn color="primary" label="Sign In" :loading="loading" @click="signIn" class="q-mb-sm" />
            <q-btn flat label="Create Account" :loading="loading" @click="register" />
            <q-separator class="q-my-sm" />
            <q-btn
              color="red"
              icon="img:https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              label="Sign in with Google"
              :loading="loading"
              @click="signInWithGoogle"
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from 'src/boot/firebase';

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const error = ref('');
    const loading = ref(false);

    async function signIn() {
      if (!email.value || !password.value) return;
      loading.value = true;
      error.value = '';
      try {
        const cred = await signInWithEmailAndPassword(auth, email.value, password.value);
        if (cred.user.emailVerified) {
          await router.push('/');
        } else {
          await sendEmailVerification(cred.user);
          await router.push('/verify-email');
        }
      } catch (e: unknown) {
        error.value = (e as { message: string }).message;
      } finally {
        loading.value = false;
      }
    }

    async function register() {
      if (!email.value || !password.value) return;
      loading.value = true;
      error.value = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
        await sendEmailVerification(cred.user);
        await router.push('/verify-email');
      } catch (e: unknown) {
        error.value = (e as { message: string }).message;
      } finally {
        loading.value = false;
      }
    }

    async function signInWithGoogle() {
      loading.value = true;
      error.value = '';
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        await router.push('/');
      } catch (e: unknown) {
        error.value = (e as { message: string }).message;
      } finally {
        loading.value = false;
      }
    }

    return { email, password, showPassword, error, loading, signIn, register, signInWithGoogle };
  },
});
</script>
