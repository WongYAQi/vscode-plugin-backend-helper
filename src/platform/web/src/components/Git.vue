<template>
  <div class='content'>
    <div class>
      <form>
        <div class='form-item'>
          <div class='form-item__label'>
            <label>Email</label>
            <p>用户的 Gitlab 邮箱账号</p>
          </div>
          <div class='form-item__body'>
          </div>
        </div>
        <div class='form-item'>
          <div class='form-item__label'>
            <label>SSH Key</label>
            <p>生成 Ssh key，用于 Gitlab 中用户认证</p>
          </div>
          <div class='form-item__body'>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'logwire-development-git'
}
</script>

<style>

</style>