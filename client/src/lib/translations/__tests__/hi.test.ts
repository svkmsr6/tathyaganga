import hi from '../hi';

describe('Hindi Translations', () => {
  describe('Auth Section', () => {
    it('should have correct welcome message', () => {
      expect(hi.auth.welcome).toBe("तथ्यगंगा में आपका स्वागत है");
    });

    it('should have correct login related messages', () => {
      expect(hi.auth.login.title).toBe("लॉगिन विफल");
      expect(hi.auth.login.success).toBe("वापसी पर स्वागत है!");
    });

    it('should have correct registration messages', () => {
      expect(hi.auth.register.title).toBe("पंजीकरण विफल");
      expect(hi.auth.register.success).toBe("तथ्यगंगा में आपका स्वागत है!");
    });

    it('should have form labels and hints', () => {
      expect(hi.auth.form.username).toBe("उपयोगकर्ता नाम");
      expect(hi.auth.form.password).toBe("पासवर्ड");
      expect(hi.auth.form.loginButton).toBe("लॉगिन");
      expect(hi.auth.form.registerButton).toBe("पंजीकरण");
    });
  });

  describe('Common Section', () => {
    it('should have common UI texts', () => {
      expect(hi.common.loading).toBe("लोड हो रहा है...");
      expect(hi.common.error).toBe("त्रुटि");
      expect(hi.common.success).toBe("सफलता");
      expect(hi.common.appName).toBe("तथ्यगंगा");
    });
  });

  describe('Navigation Section', () => {
    it('should have navigation labels', () => {
      expect(hi.nav.dashboard).toBe("डैशबोर्ड");
      expect(hi.nav.newContent).toBe("नई सामग्री");
      expect(hi.nav.settings).toBe("सेटिंग्स");
      expect(hi.nav.logout).toBe("लॉगआउट");
    });
  });

  describe('Editor Section', () => {
    it('should have editor related texts', () => {
      expect(hi.editor.title).toBe("सामग्री संपादक");
      expect(hi.editor.saveButton).toBe("सहेजें");
      expect(hi.editor.publishButton).toBe("प्रकाशित करें");
    });

    it('should have validation messages', () => {
      expect(hi.editor.validation.titleLength).toBe("शीर्षक 2 से 50 शब्दों के बीच होना चाहिए");
      expect(hi.editor.validation.contentLength).toBe("सामग्री 50 से 500 शब्दों के बीच होनी चाहिए");
    });
  });

  describe('Dashboard Section', () => {
    it('should have dashboard texts', () => {
      const welcomeWithUsername = hi.dashboard.welcome.replace('{username}', 'TestUser');
      expect(welcomeWithUsername).toBe("स्वागत है, TestUser");
      expect(hi.dashboard.noContent).toBe("अभी तक कोई सामग्री नहीं");
    });
  });
});
