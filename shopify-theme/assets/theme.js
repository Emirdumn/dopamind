/* ============================================
   Dopamind Shopify Theme - Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     Dopamind Global Namespace
  ------------------------------------------ */
  window.Dopamind = window.Dopamind || {};

  /**
   * Format cents into a display currency string.
   * Uses the theme's moneyFormat or falls back to ${{amount}}.
   */
  Dopamind.formatMoney = function (cents) {
    if (typeof cents === 'string') {
      cents = parseInt(cents.replace(/[^0-9]/g, ''), 10);
    }
    var amount = (cents / 100).toFixed(2);
    var format =
      (window.Shopify && window.Shopify.locale === 'tr')
        ? '{{amount}} TL'
        : (window.theme && window.theme.moneyFormat) || '${{amount}}';
    return format
      .replace('{{amount}}', amount)
      .replace('{{amount_no_decimals}}', Math.round(cents / 100));
  };

  /* ------------------------------------------
     Cart Drawer (open/close with overlay)
  ------------------------------------------ */
  var CartDrawer = {
    selectors: {
      drawer: '.cart-drawer',
      overlay: '.cart-drawer-overlay',
      openBtn: '[data-cart-open]',
      closeBtn: '.cart-drawer__close',
      items: '.cart-drawer__items',
      footer: '.cart-drawer__footer',
      subtotalAmount: '.cart-drawer__subtotal-amount',
      cartCount: '[data-cart-count]',
      itemCount: '.cart-drawer__item-count'
    },

    init: function () {
      this.drawer = document.querySelector(this.selectors.drawer);
      this.overlay = document.querySelector(this.selectors.overlay);
      if (!this.drawer) return;

      var self = this;

      // Open buttons
      document.querySelectorAll(this.selectors.openBtn).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          self.open();
        });
      });

      // Close button
      var closeBtn = this.drawer.querySelector(this.selectors.closeBtn);
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          self.close();
        });
      }

      // Overlay click to close
      if (this.overlay) {
        this.overlay.addEventListener('click', function () {
          self.close();
        });
      }

      // Escape key to close
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.isOpen()) {
          self.close();
        }
      });

      // Delegated click for remove buttons inside drawer
      this.drawer.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
          e.preventDefault();
          var key = removeBtn.dataset.cartRemove;
          self.removeItem(key);
        }
      });

      // Load initial cart state
      this.refreshCart();
    },

    isOpen: function () {
      return this.drawer && this.drawer.classList.contains('is-open');
    },

    open: function () {
      if (!this.drawer) return;
      this.drawer.classList.add('is-open');
      if (this.overlay) this.overlay.classList.add('is-visible');
      document.body.classList.add('no-scroll');
      this.drawer.setAttribute('aria-hidden', 'false');

      var closeBtn = this.drawer.querySelector(this.selectors.closeBtn);
      if (closeBtn) closeBtn.focus();
    },

    close: function () {
      if (!this.drawer) return;
      this.drawer.classList.remove('is-open');
      if (this.overlay) this.overlay.classList.remove('is-visible');
      document.body.classList.remove('no-scroll');
      this.drawer.setAttribute('aria-hidden', 'true');
    },

    refreshCart: function () {
      var self = this;
      fetch('/cart.js', {
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          self.renderCart(cart);
          self.updateCartCount(cart.item_count);
        })
        .catch(function (err) {
          console.error('Failed to fetch cart:', err);
        });
    },

    renderCart: function (cart) {
      var body = this.drawer.querySelector(this.selectors.items);
      var footer = this.drawer.querySelector(this.selectors.footer);
      if (!body) return;

      if (cart.item_count === 0) {
        body.innerHTML =
          '<div class="cart-drawer__empty">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />' +
            '</svg>' +
            '<p>Your cart is empty</p>' +
            '<a href="/collections/all" class="btn btn-primary btn--sm">Continue Shopping</a>' +
          '</div>';
        if (footer) footer.style.display = 'none';
        return;
      }

      if (footer) footer.style.display = '';

      var html = cart.items.map(function (item) {
        var imgSrc = (item.featured_image && item.featured_image.url) || item.image || '';
        return (
          '<div class="cart-item" data-key="' + item.key + '">' +
            '<img class="cart-item__image" src="' + imgSrc + '" alt="' + item.title + '" loading="lazy">' +
            '<div class="cart-item__details">' +
              '<div class="cart-item__title">' + item.product_title + '</div>' +
              (item.variant_title
                ? '<div class="cart-item__variant">' + item.variant_title + '</div>'
                : '') +
              '<div class="cart-item__bottom">' +
                '<div class="quantity-selector" data-quantity-key="' + item.key + '">' +
                  '<button class="quantity-selector__btn" data-quantity-change="-1" aria-label="Decrease quantity">&minus;</button>' +
                  '<input class="quantity-selector__input" type="number" value="' + item.quantity + '" min="1" aria-label="Quantity" data-quantity-input>' +
                  '<button class="quantity-selector__btn" data-quantity-change="1" aria-label="Increase quantity">&plus;</button>' +
                '</div>' +
                '<span class="cart-item__price">' + Dopamind.formatMoney(item.final_line_price) + '</span>' +
              '</div>' +
              '<button class="cart-item__remove" data-cart-remove="' + item.key + '">Remove</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      body.innerHTML = html;

      var subtotal = this.drawer.querySelector(this.selectors.subtotalAmount);
      if (subtotal) {
        subtotal.textContent = Dopamind.formatMoney(cart.total_price);
      }
    },

    updateCartCount: function (count) {
      document.querySelectorAll(this.selectors.cartCount).forEach(function (el) {
        el.textContent = count;
        el.dataset.count = count;
        el.style.display = count > 0 ? '' : 'none';
      });
    },

    removeItem: function (key) {
      var self = this;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          self.renderCart(cart);
          self.updateCartCount(cart.item_count);
        })
        .catch(function (err) {
          console.error('Failed to remove item:', err);
        });
    }
  };

  /* ------------------------------------------
     Mobile Menu Toggle
  ------------------------------------------ */
  var MobileMenu = {
    selectors: {
      toggle: '.site-header__menu-toggle',
      nav: '.site-header__nav'
    },

    init: function () {
      this.toggle = document.querySelector(this.selectors.toggle);
      this.nav = document.querySelector(this.selectors.nav);
      if (!this.toggle || !this.nav) return;

      var self = this;

      this.toggle.addEventListener('click', function (e) {
        e.preventDefault();
        self.toggleMenu();
      });

      // Close on escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.isOpen()) {
          self.closeMenu();
        }
      });

      // Close when a nav link is clicked
      this.nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          self.closeMenu();
        });
      });
    },

    isOpen: function () {
      return this.nav && this.nav.classList.contains('is-open');
    },

    toggleMenu: function () {
      if (this.isOpen()) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    openMenu: function () {
      this.nav.classList.add('is-open');
      this.toggle.classList.add('is-active');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    },

    closeMenu: function () {
      this.nav.classList.remove('is-open');
      this.toggle.classList.remove('is-active');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  };

  /* ------------------------------------------
     Add to Cart (Shopify AJAX /cart/add.js)
  ------------------------------------------ */
  var AddToCart = {
    init: function () {
      var self = this;

      // Handle form submissions with data-add-to-cart-form
      document.addEventListener('submit', function (e) {
        var form = e.target.closest('[data-add-to-cart-form]');
        if (!form) return;
        e.preventDefault();
        self.handleForm(form);
      });

      // Handle direct button clicks with data-add-to-cart="variantId"
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-add-to-cart]');
        if (!btn) return;
        e.preventDefault();
        var variantId = btn.dataset.addToCart;
        var quantity = parseInt(btn.dataset.quantity, 10) || 1;
        self.add(variantId, quantity, btn);
      });
    },

    handleForm: function (form) {
      var submitBtn = form.querySelector('[type="submit"]');
      var formData = new FormData(form);
      var variantId = formData.get('id');
      var quantity = parseInt(formData.get('quantity'), 10) || 1;
      if (!variantId) return;
      this.add(variantId, quantity, submitBtn);
    },

    add: function (variantId, quantity, triggerEl) {
      if (!variantId) return;

      if (triggerEl) {
        triggerEl.disabled = true;
        triggerEl.dataset.originalText = triggerEl.textContent;
        triggerEl.textContent = 'Adding...';
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: parseInt(variantId, 10), quantity: quantity }]
        })
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (data) {
              throw new Error(data.description || 'Could not add to cart');
            });
          }
          return res.json();
        })
        .then(function () {
          CartDrawer.refreshCart();
          CartDrawer.open();

          if (triggerEl) {
            triggerEl.textContent = 'Added!';
            setTimeout(function () {
              triggerEl.textContent = triggerEl.dataset.originalText;
              triggerEl.disabled = false;
            }, 1500);
          }
        })
        .catch(function (err) {
          console.error('Add to cart error:', err);
          if (triggerEl) {
            triggerEl.textContent = 'Error';
            setTimeout(function () {
              triggerEl.textContent = triggerEl.dataset.originalText;
              triggerEl.disabled = false;
            }, 2000);
          }
        });
    }
  };

  /* ------------------------------------------
     Update Cart Count (standalone helper)
  ------------------------------------------ */
  function updateCartCount() {
    fetch('/cart.js', {
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        CartDrawer.updateCartCount(cart.item_count);
      })
      .catch(function (err) {
        console.error('Failed to update cart count:', err);
      });
  }

  /* ------------------------------------------
     Quantity +/- Controls
  ------------------------------------------ */
  var QuantityControls = {
    init: function () {
      var self = this;

      // Delegated click for +/- buttons
      document.addEventListener('click', function (e) {
        var changeBtn = e.target.closest('[data-quantity-change]');
        if (!changeBtn) return;

        var wrapper = changeBtn.closest('.quantity-selector');
        if (!wrapper) return;

        var input = wrapper.querySelector('[data-quantity-input]');
        if (!input) return;

        var delta = parseInt(changeBtn.dataset.quantityChange, 10);
        var currentVal = parseInt(input.value, 10) || 1;
        var min = parseInt(input.min, 10) || 1;
        var max = parseInt(input.max, 10) || 9999;
        var newVal = Math.max(min, Math.min(max, currentVal + delta));

        input.value = newVal;
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // If inside cart drawer, update the cart
        var key = wrapper.dataset.quantityKey;
        if (key) {
          self.updateCartQuantity(key, newVal);
        }
      });

      // Handle direct input changes
      document.addEventListener('change', function (e) {
        var input = e.target.closest('[data-quantity-input]');
        if (!input) return;

        var wrapper = input.closest('.quantity-selector');
        var key = wrapper ? wrapper.dataset.quantityKey : null;
        var val = parseInt(input.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        input.value = val;

        if (key) {
          self.updateCartQuantity(key, val);
        }
      });
    },

    updateCartQuantity: function (key, quantity) {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          CartDrawer.renderCart(cart);
          CartDrawer.updateCartCount(cart.item_count);
        })
        .catch(function (err) {
          console.error('Failed to update quantity:', err);
        });
    }
  };

  /* ------------------------------------------
     Remove from Cart (delegated, standalone)
  ------------------------------------------ */
  var RemoveFromCart = {
    init: function () {
      // Handles remove buttons outside the cart drawer (e.g., on cart page)
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-from-cart]');
        if (!btn) return;
        e.preventDefault();

        var key = btn.dataset.removeFromCart;
        if (!key) return;

        btn.disabled = true;

        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: 0 })
        })
          .then(function (res) { return res.json(); })
          .then(function (cart) {
            CartDrawer.updateCartCount(cart.item_count);

            // Remove the line item row from the DOM if on cart page
            var row = btn.closest('[data-cart-item]');
            if (row) {
              row.style.transition = 'opacity 0.3s ease, max-height 0.3s ease';
              row.style.opacity = '0';
              row.style.maxHeight = '0';
              row.style.overflow = 'hidden';
              setTimeout(function () { row.remove(); }, 350);
            }

            // Refresh drawer if open
            if (CartDrawer.isOpen()) {
              CartDrawer.renderCart(cart);
            }
          })
          .catch(function (err) {
            console.error('Failed to remove item:', err);
            btn.disabled = false;
          });
      });
    }
  };

  /* ------------------------------------------
     Testimonials Carousel (Horizontal Scroll)
  ------------------------------------------ */
  var TestimonialsCarousel = {
    init: function () {
      document.querySelectorAll('.testimonial-carousel').forEach(function (carousel) {
        var prevBtn = carousel.parentElement.querySelector('.testimonial-carousel__btn--prev');
        var nextBtn = carousel.parentElement.querySelector('.testimonial-carousel__btn--next');

        if (!prevBtn && !nextBtn) return;

        var getScrollAmount = function () {
          var card = carousel.querySelector('.testimonial-card');
          if (!card) return 360;
          var style = getComputedStyle(carousel);
          var gap = parseFloat(style.gap) || 0;
          return card.offsetWidth + gap;
        };

        if (prevBtn) {
          prevBtn.addEventListener('click', function () {
            carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', function () {
            carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
          });
        }
      });
    }
  };

  /* ------------------------------------------
     Smooth Scroll (anchor links)
  ------------------------------------------ */
  var SmoothScroll = {
    init: function () {
      document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;

        var targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var header = document.querySelector('.site-header');
        var headerHeight = header ? header.offsetHeight : 70;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({ top: top, behavior: 'smooth' });

        // Close mobile menu if open
        if (MobileMenu.isOpen()) {
          MobileMenu.closeMenu();
        }
      });
    }
  };

  /* ------------------------------------------
     Header Scroll Behavior
  ------------------------------------------ */
  var HeaderScroll = {
    init: function () {
      var header = document.querySelector('.site-header');
      if (!header) return;

      var onScroll = function () {
        header.classList.toggle('site-header--scrolled', window.scrollY > 50);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  };

  /* ------------------------------------------
     Scroll Reveal Animations
  ------------------------------------------ */
  var ScrollReveal = {
    init: function () {
      var elements = document.querySelectorAll('.reveal, [data-animate]');
      if (elements.length === 0) return;

      if (!('IntersectionObserver' in window)) {
        elements.forEach(function (el) {
          el.classList.add('is-visible');
        });
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var delay = parseInt(entry.target.dataset.animateDelay, 10) || 0;
              setTimeout(function () {
                entry.target.classList.add('is-visible');
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach(function (el) {
        observer.observe(el);
      });
    }
  };

  /* ------------------------------------------
     Expose modules on global namespace
  ------------------------------------------ */
  Dopamind.CartDrawer = CartDrawer;
  Dopamind.MobileMenu = MobileMenu;
  Dopamind.AddToCart = AddToCart;
  Dopamind.updateCartCount = updateCartCount;

  /* ------------------------------------------
     Initialize All Modules on DOMContentLoaded
  ------------------------------------------ */
  function init() {
    CartDrawer.init();
    MobileMenu.init();
    AddToCart.init();
    QuantityControls.init();
    RemoveFromCart.init();
    TestimonialsCarousel.init();
    SmoothScroll.init();
    HeaderScroll.init();
    ScrollReveal.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
