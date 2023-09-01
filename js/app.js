function updateNavBorders() {
    const navParentDiv = $('#primary-nav').parent(); 
    // only check wrap if visible
    if (navParentDiv.css('display') != 'none') {
        const navListTop = navParentDiv.offset().top; 
        const navBrandTop = $('.navbar-brand').offset().top; 
        // if wrapped then set border-right-width to zero
        if (navListTop != navBrandTop)
            $('#primary-nav a.border-end').addClass('border-end-0').removeClass('border-end-1');
        else 
            $('#primary-nav a.border-end').addClass('border-end-1').removeClass('border-end-0');
    }
}

// dynamically positions a Bootstrap dropdown based on which side of the window has more space available
function dynamicallyPositionDropdown(dropdownMenu) {
    const parentLi = dropdownMenu.parent(); 
    const dropdownToggle = parentLi.find('.p-dropdown-toggle'); 
    const spaceLeftX = dropdownToggle.offset().left; 
    const spaceRightX = $(window).width() - spaceLeftX; 

    let placementX = 0;
    if (spaceLeftX > spaceRightX) {
        const placement = dropdownToggle.offset().left + dropdownToggle.outerWidth() 
            - dropdownMenu.outerWidth();
        placementX = Math.max(0, placement);
    } else {
        placementX = Math.min($(window).width() - dropdownMenu.outerWidth(), 
            dropdownToggle.offset().left); 
    }

    dropdownMenu.offset({left: placementX});
}

function openDropdown(dropdown) {
    if (dropdown.is(":hidden")) {
        dropdown.dropdown('toggle');
        // manually set aria-expanded for accessbility purposes
        $('.dropdown .p-dropdown-toggle').attr('aria-expanded', 'true');

        if ($(window).width() >= MD_BREAKPOINT) {
            // if this dropdown is a nav descendant than dynamically position it
            if ($(this).closest($('#primary-nav'))) {
                dynamicallyPositionDropdown(dropdown);
            }
        }
    }
}

function closeDropdown(dropdown) {
    if (dropdown.is(':visible')) {
        dropdown.dropdown('toggle');
        // manually set aria-expanded for accessbility purposes
        $('.dropdown .p-dropdown-toggle').attr('aria-expanded', 'false');
    }
}

function toggleDropdown(dropdown) {
    if (dropdown.is(':hidden')) {
        openDropdown(dropdown);
    } else if (dropdown.is(':visible')) {
        closeDropdown(dropdown); 
    }
}

function togglePlusIcon(icon) {
    icon.addClass('fa-plus').removeClass('fa-minus');
}

function toggleMinusIcon(icon) {
    icon.addClass('fa-minus').removeClass('fa-plus');
}

function getCollapseButton(collapseElement) {
    return $(`.btn[href="#${collapseElement.attr('id')}"]`)
}   

function animatePlusIcon(icon) {
    const currentTransform = icon.css('transform');
    if (currentTransform == 'matrix(-1, 0, 0, -1, 0, 0)') {
        icon.css({'transform': 'none'});
    } else {
        icon.css({'transform': 'rotate(0.5turn)'});
    }
}

const MD_BREAKPOINT = 768;
const LG_BREAKPOINT = 992; 
const XL_BREAKPOINT = 1200;

$(function() {
    // update nav borders on page load
    // wait a second for header width animation to finish
    setTimeout(function() {
        updateNavBorders();
    }, 1000);


    let currentWindowWidth = $(window).width(); 
    $(window).resize(function(e) {
        updateNavBorders(); 

        // disable dropdowns when md breakpoint is hit
        if ((currentWindowWidth < MD_BREAKPOINT && $(window).width() >= MD_BREAKPOINT) ||
             currentWindowWidth >= MD_BREAKPOINT && $(window).width() < MD_BREAKPOINT) {
            $('#primary-nav .dropdown-menu.show').each(function() {
                toggleDropdown($(this));
            })
        }
        if ((currentWindowWidth < LG_BREAKPOINT && $(window).width() >= LG_BREAKPOINT) ||
        currentWindowWidth >= LG_BREAKPOINT && $(window).width() < LG_BREAKPOINT) {
            // between breakpoints reset <main> collapsibles

            if (!$('#contact-card-1').hasClass('show') && !$('#contact-card-2').hasClass('show')) {
                $('#contact-card-1').collapse('show');
            }
        }

        currentWindowWidth = $(window).width(); 
    });

    // focus search bar on search bar being toggled
    $('#btn-searchbar').click(function() {
        $('#input-searchbar').focus(); 
    }); 
    
    // hide search bar on loss of focus
    $('#div-searchbar').focusout(function() {
        $(this).collapse('hide'); 
    });

    // toggle btn-offcanvas between menu and close icon
    const btnOffCanvasIcon = $('#btn-offcanvas').children('i'); 
    $('#nav-offcanvas').on('shown.bs.offcanvas', function() {
        btnOffCanvasIcon.addClass('fa-xmark').removeClass('fa-bars');
    });
    $('#nav-offcanvas').on('hidden.bs.offcanvas', function() {
        btnOffCanvasIcon.addClass('fa-bars').removeClass('fa-xmark');
    });

    $('#primary-nav .dropdown-menu').on({
        'shown.bs.dropdown': function() {
            const icon = $(this).parent().find('.btn-expand i'); 
            toggleMinusIcon(icon);
            $(this).parent().addClass('show');
        }, 
        'hidden.bs.dropdown': function() {
            const icon = $(this).parent().find('.btn-expand i'); 
            togglePlusIcon(icon);
            $(this).parent().removeClass('show'); 
        }
    });

    $(document).on('mouseover', '.dropdown, .p-dropdown-toggle', function() {
        // only show dropdown if nav is expanded
        if (currentWindowWidth >= MD_BREAKPOINT) {
            const dropdownMenu = $(this).find('.dropdown-menu');
            openDropdown(dropdownMenu);
        }
    });

    $(document).on('mouseout', '.dropdown', function() {
        if (currentWindowWidth >= MD_BREAKPOINT) {
            const dropdownMenu = $(this).find('.dropdown-menu');
            closeDropdown(dropdownMenu);
        }
    });

    // toggle nav dropdowns and change icon
    $('#primary-nav .btn-expand').click(function() {
        toggleDropdown($(this).parent().parent().find('.dropdown-menu'));
    });

    $('.container-collapse button').click(function() {
        const collapseBtn = $(this).parent().find('.btn-collapse');
        if ($(this)[0] !== collapseBtn[0]) {
            collapseBtn.click(); 
        }
    });

    $('main .collapse').on({'hide.bs.collapse': function() {
        const btn = getCollapseButton($(this));
        const icon = btn.parent().find('i.fa-minus');
        animatePlusIcon(icon); 
        togglePlusIcon(icon);
    }, 'show.bs.collapse': function() {
        const btn = getCollapseButton($(this));
        const icon = btn.parent().find('i.fa-plus');
        animatePlusIcon(icon);
        toggleMinusIcon(icon);
    }});

    $('#contact-card-1').on({'hide.bs.collapse': function(e) {
        if ($(window).width() >= LG_BREAKPOINT && $('.btn[href="#contact-card-2"]').attr('aria-expanded') !== 'true') {
            e.preventDefault();
            return;
        }
        const btn = getCollapseButton($(this));
        btn.attr('aria-expanded', false);
    }, 'show.bs.collapse': function() {
        const btn = getCollapseButton($(this));
        btn.attr('aria-expanded', true);
        if ($(window).width() > LG_BREAKPOINT) {
            $('#contact-card-2').collapse('hide'); 
        }
    }});

    $('#contact-card-2').on({'hide.bs.collapse': function(e) {
        if ($(window).width() >= LG_BREAKPOINT && $('.btn[href="#contact-card-1"]').attr('aria-expanded') !== 'true') {
            e.preventDefault();
            return;
        }
        const btn = getCollapseButton($(this));
        btn.attr('aria-expanded', false);
    }, 'show.bs.collapse': function() {
        const btn = getCollapseButton($(this));
        btn.attr('aria-expanded', true);
        if ($(window).width() >= LG_BREAKPOINT) {
            $('#contact-card-1').collapse('hide'); 
        }
    }});
});