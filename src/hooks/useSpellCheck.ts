import { onMounted, ref } from "vue";

function applySpellCheck(isEnabled: boolean) {
  const html = document.querySelector(".milkdown") as HTMLElement;
  if (isEnabled) {
    html.setAttribute("spellcheck", "true");
    localStorage.setItem("spellcheck", "true");
  } else {
    html.setAttribute("spellcheck", "false");
    localStorage.setItem("spellcheck", "false");
  }
}

export default function useSpellCheck() {
  const isSpellCheckEnabled = ref(localStorage.getItem("spellcheck") === "true");
  applySpellCheck(isSpellCheckEnabled.value);
  onMounted(() => {
    const savedSpellCheck = localStorage.getItem("spellcheck");
    if (savedSpellCheck) {
      isSpellCheckEnabled.value = savedSpellCheck === "true";
      applySpellCheck(isSpellCheckEnabled.value);
    }
  });
  return {
    isSpellCheckEnabled,
    applySpellCheck
  }
}