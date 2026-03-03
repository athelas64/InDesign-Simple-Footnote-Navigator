#targetengine "footnoteNavigator_v4"

(function() {
    
    // --- UI CREATION ---
    // Create the palette
    var w = new Window("palette", "Footnote Nav", undefined, {closeButton: true});
    w.spacing = 5;
    w.margins = 10;

    // --- ROW 1: Search ---
    var g1 = w.add("group");
    g1.orientation = "row";
    
    g1.add("statictext", undefined, "Fn #:");
    
    var inpNumber = g1.add("edittext", undefined, "");
    inpNumber.characters = 5;
    inpNumber.active = true; 
    
    var btnGo = g1.add("button", undefined, "Go");
    btnGo.size = [40, 25];

    // --- ROW 2: Navigation ---
    var g2 = w.add("group");
    g2.orientation = "row";
    
    var btnPrev = g2.add("button", undefined, "Previous");
    var btnNext = g2.add("button", undefined, "Next");

    // --- LOGIC VARIABLES ---
    var currentNoteIndex = -1; 

    // --- HELPER FUNCTIONS ---
    function getAllFootnotes() {
        app.findGrepPreferences = app.changeGrepPreferences = null;
        app.findGrepPreferences.findWhat = "~F"; 
        return app.activeDocument.findGrep();
    }

    function findClosestIndex(notes) {
        if (app.selection.length > 0 && app.selection[0].hasOwnProperty("baseline")) {
             var activePageObj = app.activeWindow.activePage;
             var activePageOffset = activePageObj.documentOffset;
             for (var i = 0; i < notes.length; i++) {
                 try {
                     var notePage = notes[i].parentTextFrames[0].parentPage;
                     if (notePage.documentOffset >= activePageOffset) {
                         return i;
                     }
                 } catch(e) { }
             }
        }
        return 0; 
    }

    function doJump(index, notes) {
        if (index < 0 || index >= notes.length) {
            return; // Silently fail at boundaries
        }
        var targetRef = notes[index];
        try {
            app.activeWindow.activePage = targetRef.parentTextFrames[0].parentPage;
            targetRef.select();
            currentNoteIndex = index;
            inpNumber.text = (index + 1).toString();
        } catch (e) {
            alert("Footnote #" + (index+1) + " is hidden in OVERSET text.");
        }
    }

    // --- EVENT LISTENERS ---

    // 1. Sanitization (Numbers Only)
    inpNumber.onChanging = function() {
        if (this.text.match(/[^0-9]/g)) {
            this.text = this.text.replace(/[^0-9]/g, '');
        }
    };

    // 2. Button Actions
    btnGo.onClick = function() {
        var num = parseInt(inpNumber.text);
        if (!isNaN(num) && num > 0) {
            doJump(num - 1, getAllFootnotes()); 
        }
    };

    btnNext.onClick = function() {
        var notes = getAllFootnotes();
        if (currentNoteIndex === -1) currentNoteIndex = findClosestIndex(notes) - 1; 
        doJump(currentNoteIndex + 1, notes);
    };

    btnPrev.onClick = function() {
        var notes = getAllFootnotes();
        if (currentNoteIndex === -1) currentNoteIndex = findClosestIndex(notes);
        doJump(currentNoteIndex - 1, notes);
    };

    // 3. ENTER Key (Trigger Go)
    inpNumber.addEventListener("keydown", function(k) {
        if (k.keyName == "Enter") {
            btnGo.notify("onClick");
        }
    });

    // 4. ESCAPE Key (Close Window) - Zero UI footprint
    w.addEventListener("keydown", function(k) {
        if (k.keyName == "Escape") {
            w.close();
        }
    });

    w.show();

})();