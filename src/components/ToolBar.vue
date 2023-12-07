<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand bg-body-tertiary">
    <div class="container-fluid">
      <span class="navbar-brand">
        <!-- <img src="@/assets/logo.png" height="24"> -->
        Fortis
      </span>
      <div class="me-auto">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link" :class="($route.name === 'editor') ? 'active' : ''" to="/editor">Editor</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="($route.name === 'robustness') ? 'active' : ''" to="/robustness">Robustness</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="($route.name === 'robustify') ? 'active' : ''" to="/robustify">Robustification</RouterLink>
          </li>
          <!-- <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Dropdown
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li> -->
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  --bs-navbar-padding-y: 0;
  /* --bs-navbar-brand-font-size: var(--bs-nav-link-font-size); */
}
</style>