/**
 * CampusFind - User Profile Controller
 * Manages profile information, avatar photo upload, and multi-step password security verification
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
  setupPasswordTogglesLocal();
});

let isCurrentPasswordVerified = false;

async function initProfilePage() {
  const session = getUserSession();
  if (!session || !session.user) {
    showToast('Please sign in to view your profile.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
    return;
  }

  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const studentIdInput = document.getElementById('profile-student-id');
  const deptInput = document.getElementById('profile-dept');

  // Fill from cache initially
  if (nameInput) nameInput.value = session.user.name || '';
  if (emailInput) emailInput.value = session.user.email || '';
  if (studentIdInput) studentIdInput.value = session.user.student_id || '';
  if (deptInput) deptInput.value = session.user.department || '';

  renderAvatar(session.user);

  // Synchronize with backend API
  try {
    const res = await authFetch(`${CONFIG.API_BASE_URL}/auth/me`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        setUserSession(data.user, session.token);
        if (nameInput) nameInput.value = data.user.name;
        if (emailInput) emailInput.value = data.user.email;
        if (studentIdInput) studentIdInput.value = data.user.student_id || '';
        if (deptInput) deptInput.value = data.user.department || '';
        renderAvatar(data.user);
      }
    }
  } catch (err) {
    console.warn('Profile sync notice:', err.message);
  }

  // Handle Avatar Upload
  setupAvatarUpload(session);

  // Handle Profile Update Form Submission
  const profileForm = document.getElementById('profile-info-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedName = nameInput.value.trim();
      const updatedDept = deptInput.value.trim();
      const updatedStudentId = studentIdInput.value.trim();

      try {
        const response = await authFetch(`${CONFIG.API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: updatedName,
            department: updatedDept,
            student_id: updatedStudentId
          })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to update profile.');
        }

        setUserSession(result.user, session.token);
        showToast('Profile information updated successfully in database.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Handle Step 1: Verify Old / Current Password
  setupPasswordVerification();
}

function renderAvatar(user) {
  const avatarInitials = document.getElementById('profile-avatar-display');
  const avatarImg = document.getElementById('profile-avatar-img');

  const initials = user && user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  if (user && user.avatar_url) {
    const fullUrl = user.avatar_url.startsWith('http://') || user.avatar_url.startsWith('https://') || user.avatar_url.startsWith('data:')
      ? user.avatar_url
      : `${CONFIG.SERVER_URL}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`;

    if (avatarImg) {
      avatarImg.src = fullUrl;
      avatarImg.style.display = 'block';
      avatarImg.onerror = () => {
        // Fallback: If absolute port fetch fails, attempt relative path (useful if served from same origin)
        if (!fullUrl.startsWith('data:') && !avatarImg.dataset.retried) {
          avatarImg.dataset.retried = 'true';
          const relativePath = user.avatar_url.startsWith('/') ? user.avatar_url : `/${user.avatar_url}`;
          avatarImg.src = relativePath;
          return;
        }
        avatarImg.style.display = 'none';
        if (avatarInitials) {
          avatarInitials.style.display = 'flex';
          avatarInitials.textContent = initials;
        }
      };
    }
    if (avatarInitials) avatarInitials.style.display = 'none';
  } else {
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarInitials) {
      avatarInitials.style.display = 'flex';
      avatarInitials.textContent = initials;
    }
  }
}

function setupAvatarUpload(session) {
  const fileInput = document.getElementById('avatar-file-input');
  const uploadBtn = document.getElementById('btn-upload-avatar');
  const fileNameSpan = document.getElementById('avatar-file-name');
  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarInitials = document.getElementById('profile-avatar-display');

  if (!fileInput || !uploadBtn) return;

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (fileNameSpan) fileNameSpan.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
      uploadBtn.style.display = 'inline-block';

      // Instant client-side preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (avatarImg) {
          avatarImg.src = e.target.result;
          avatarImg.style.display = 'block';
        }
        if (avatarInitials) avatarInitials.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  uploadBtn.addEventListener('click', async () => {
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    const originalText = uploadBtn.textContent;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/auth/avatar`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload photo.');
      }

      showToast('Profile photo saved successfully!', 'success');
      uploadBtn.style.display = 'none';

      // Update session in storage
      const activeSession = getUserSession();
      const updatedUser = result.user || (activeSession && activeSession.user);
      if (activeSession && updatedUser) {
        setUserSession(updatedUser, activeSession.token);
      }

      // Re-render avatar immediately on profile card
      renderAvatar(updatedUser);

      // Re-render navbar avatar if function available
      if (typeof updateNavbarAuth === 'function') {
        updateNavbarAuth();
      }
    } catch (err) {
      console.error('Avatar upload notice:', err);
      // Graceful offline fallback: if backend is down or fetch failed, save to browser storage
      if (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const activeSession = getUserSession();
          if (activeSession && activeSession.user) {
            activeSession.user.avatar_url = dataUrl;
            setUserSession(activeSession.user, activeSession.token);
            renderAvatar(activeSession.user);
            if (typeof updateNavbarAuth === 'function') updateNavbarAuth();
          }
        };
        reader.readAsDataURL(file);
        uploadBtn.style.display = 'none';
        showToast('Saved to browser session. Start backend on port 5000 to persist to MySQL database.', 'warning', 6000);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = originalText;
    }
  });
}

function setupPasswordVerification() {
  const verifyBtn = document.getElementById('btn-verify-current-pass');
  const currentPassInput = document.getElementById('profile-current-pass');
  const statusSpan = document.getElementById('current-pass-status');
  const badge = document.getElementById('password-security-badge');
  const newFieldsWrapper = document.getElementById('new-password-fields-wrapper');
  const newPassInput = document.getElementById('profile-new-pass');
  const confirmPassInput = document.getElementById('profile-confirm-pass');
  const savePassBtn = document.getElementById('btn-save-new-password');
  const passwordForm = document.getElementById('profile-password-form');

  if (!verifyBtn || !currentPassInput) return;

  verifyBtn.addEventListener('click', async () => {
    const currentPassword = currentPassInput.value;
    if (!currentPassword) {
      showToast('Please enter your current password.', 'warning');
      currentPassInput.focus();
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';

    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/auth/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        isCurrentPasswordVerified = false;
        if (statusSpan) {
          statusSpan.textContent = '✕ Incorrect Password';
          statusSpan.style.color = 'var(--color-error, #C84B4B)';
        }
        showToast(result.message || 'Current password is incorrect.', 'error');
        return;
      }

      // Successful verification: unlock step 2
      isCurrentPasswordVerified = true;
      showToast('Current password confirmed! You can now choose a new password.', 'success');

      if (statusSpan) {
        statusSpan.textContent = '✓ Verified';
        statusSpan.style.color = 'var(--color-success, #23865B)';
      }

      if (badge) {
        badge.textContent = '✓ Identity Confirmed';
        badge.style.background = '#EAF6F0';
        badge.style.color = '#23865B';
        badge.style.border = '1px solid #23865B';
      }

      currentPassInput.readOnly = true;
      currentPassInput.style.backgroundColor = '#F0EDE6';
      verifyBtn.style.display = 'none';

      if (newFieldsWrapper) {
        newFieldsWrapper.style.opacity = '1';
        newFieldsWrapper.style.pointerEvents = 'auto';
      }
      if (newPassInput) {
        newPassInput.disabled = false;
        newPassInput.focus();
      }
      if (confirmPassInput) confirmPassInput.disabled = false;
      if (savePassBtn) savePassBtn.disabled = false;

    } catch (err) {
      showToast('Verification failed: Could not reach auth server.', 'error');
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = '🔍 Confirm Old Password';
    }
  });

  // Handle final submission of new password
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!isCurrentPasswordVerified) {
        showToast('Please verify your current password first in Step 1.', 'warning');
        currentPassInput.focus();
        return;
      }

      const currentPassword = currentPassInput.value;
      const newPassword = newPassInput.value;
      const confirmPassword = confirmPassInput.value;

      if (!newPassword || newPassword.length < 6) {
        showToast('New password must be at least 6 characters long.', 'error');
        newPassInput.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match.', 'error');
        confirmPassInput.focus();
        return;
      }

      if (savePassBtn) {
        savePassBtn.disabled = true;
        savePassBtn.textContent = 'Updating Password...';
      }

      try {
        const response = await authFetch(`${CONFIG.API_BASE_URL}/auth/change-password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to update password.');
        }

        showToast('Password updated securely with bcrypt hash!', 'success');
        
        // Reset form and lock Step 2 again
        passwordForm.reset();
        isCurrentPasswordVerified = false;
        currentPassInput.readOnly = false;
        currentPassInput.style.backgroundColor = '';
        verifyBtn.style.display = 'inline-block';

        if (statusSpan) {
          statusSpan.textContent = 'Unverified';
          statusSpan.style.color = 'var(--color-text-muted)';
        }
        if (badge) {
          badge.textContent = '🔒 Verification Required';
          badge.style.background = '#FAF4ED';
          badge.style.color = 'var(--primary-color)';
          badge.style.border = '1px solid var(--secondary-color)';
        }
        if (newFieldsWrapper) {
          newFieldsWrapper.style.opacity = '0.5';
          newFieldsWrapper.style.pointerEvents = 'none';
        }
        if (newPassInput) newPassInput.disabled = true;
        if (confirmPassInput) confirmPassInput.disabled = true;
        if (savePassBtn) {
          savePassBtn.disabled = true;
          savePassBtn.textContent = '🔐 Update Password';
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (savePassBtn) {
          savePassBtn.disabled = !isCurrentPasswordVerified;
          savePassBtn.textContent = '🔐 Update Password';
        }
      }
    });
  }
}

function setupPasswordTogglesLocal() {
  const toggleButtons = document.querySelectorAll('.btn-toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wrapper = btn.closest('.input-password-wrapper');
      if (!wrapper) return;
      const input = wrapper.querySelector('input');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });
}
