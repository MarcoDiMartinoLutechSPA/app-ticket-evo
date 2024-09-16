sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token"
],

function (Controller, MessageBox, JSONModel, Token) 
{
    "use strict";

    return Controller.extend("sap.btp.appticketevo.controller.View1", 
    {
        onInit: function() 
        {
            var oModel = new JSONModel({
                selectedClient: "",
                selectedCategory: "",
                code: "",
                emailBody: "",
                environment: "",
                variantName: "",
                transactionName: "",
                emailTo: "marco.dimartino@lutech.it",
                ccEmails: [],
                isAMS: false,
                isEVO: false,
                uploadedFile: null
            });

            this.getView().setModel(oModel); 
            
            var oVisibilityModel = new JSONModel({
                backButtonVisible: false,
                nextButtonVisible: true, 
                sendButtonVisible: false
            });
            
            this.getView().setModel(oVisibilityModel, "visibilityModel");

			var oMultiInput = this.getView().byId("multiInput");

			// add validator
			var fnValidator = function(args){
				var text = args.text;
				return new Token({key: text, text: text});
			};

			oMultiInput.addValidator(fnValidator);
        },

        resetModelData: function() 
        {
            var oModel = this.getView().getModel();

            oModel.setProperty("/code", "");
            oModel.setProperty("/emailBody", "");
            oModel.setProperty("/uploadedFile", "");

            if (oModel.getProperty("/isAMS")) 
            {
                oModel.setProperty("/environment", "");
                oModel.setProperty("/variantName", "");
                oModel.setProperty("/transactionName", "");
            }
        },

        onCategoryChange: function(oEvent) 
        {
            var oSelect = oEvent.getSource();
            var sSelectedCategory = oSelect.getSelectedKey();

            if (!sSelectedCategory) 
            {
                MessageBox.error("Selezionare una categoria valida.");
                return;
            }

            var oModel = this.getView().getModel();
            var oStep2Container = this.getView().byId("step2Container");

            // Reset del modello quando cambia la categoria
            this.resetModelData();

            // Rimuovi e distruggi tutti gli elementi precedenti nel contenitore
            if (oStep2Container.getItems().length > 0) 
            {
                oStep2Container.getItems().forEach(function(item) 
                {
                    item.destroy();
                });
            }

            // Carica e aggiungi il frammento appropriato in base alla categoria selezionata
            if (sSelectedCategory === "AMS") 
            {
                oModel.setProperty("/isAMS", true);
                oModel.setProperty("/isEVO", false);

                sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "sap.btp.appticketevo.view.fragment.Step2AMS",
                    controller: this
                }).then(function(oFragment) 
                {
                    oStep2Container.addItem(oFragment);
                });

            } 
            else if (sSelectedCategory === "EVO") 
            {
                oModel.setProperty("/isAMS", false);
                oModel.setProperty("/isEVO", true);

                sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "sap.btp.appticketevo.view.fragment.Step2EVO",
                    controller: this
                }).then(function(oFragment) 
                {
                    oStep2Container.addItem(oFragment);
                });
            }
        },

        onNextStep: function() 
        {
            var oModel = this.getView().getModel();
            var sSelectedClient = oModel.getProperty("/selectedClient");
            var sSelectedCategory = oModel.getProperty("/selectedCategory");

            if (!sSelectedClient || !sSelectedCategory) 
            {
                MessageBox.error("Selezionare un Cliente e una Categoria per procedere.");
                return;
            }

            var oWizard = this.byId("wizard");
            var oCurrentStep = oWizard.getCurrentStep();
            var oVisibilityModel = this.getView().getModel("visibilityModel");

            if (oCurrentStep === "__step1" && sSelectedCategory === "EVO") 
            {
                var sCode = oModel.getProperty("/code");
                var sEmailBody = oModel.getProperty("/emailBody");

                if (!sCode || !sEmailBody) 
                {
                    MessageBox.error("Compilare tutti i campi obbligatori: Codice Evo e Corpo mail.");
                    return;
                }

                var oFileUploader = this.byId("fileUploaderEVO");

                if (!oFileUploader.getValue()) 
                {
                    MessageBox.error("È necessario caricare un file di Analisi Funzionale per procedere.");
                    return;
                }
            } 
            else if (oCurrentStep === "__step1" && sSelectedCategory === "AMS") 
            {
                var sCodeAMS = oModel.getProperty("/code");
                var sEmailBodyAMS = oModel.getProperty("/emailBody");
                var sEnvironmentAMS = oModel.getProperty("/environment");
                var sVariantNameAMS = oModel.getProperty("/variantName");
                var sTransactionNameAMS = oModel.getProperty("/transactionName");

                if (!sCodeAMS || !sEmailBodyAMS || !sEnvironmentAMS || !sVariantNameAMS || !sTransactionNameAMS) 
                {
                    MessageBox.error("Compilare tutti i campi obbligatori: Codice Ticket, Corpo mail, Ambiente, Nome Variante e Oggetto/Transazione.");
                    return;
                }
            }

            oWizard.nextStep();

            var oNewStep = oWizard.getCurrentStep();

            // Aggiorna la visibilità dei pulsanti in base allo step corrente
            if (oNewStep === "__step1") 
            { // Step intermedio
                oVisibilityModel.setProperty("/nextButtonVisible", true);
                oVisibilityModel.setProperty("/backButtonVisible", true);
                oVisibilityModel.setProperty("/sendButtonVisible", false);
            } 
            else if (oNewStep === "__step2") 
            { // Ultimo step
                oVisibilityModel.setProperty("/nextButtonVisible", false);
                oVisibilityModel.setProperty("/backButtonVisible", true);
                oVisibilityModel.setProperty("/sendButtonVisible", true);
            } 
            else if (oNewStep === "__step0") 
            { // Step iniziale
                oVisibilityModel.setProperty("/nextButtonVisible", true);
                oVisibilityModel.setProperty("/backButtonVisible", false);
                oVisibilityModel.setProperty("/sendButtonVisible", false);
            }
        },

        onPreviousStep: function() 
        {
            var oWizard = this.byId("wizard");
            var oVisibilityModel = this.getView().getModel("visibilityModel");

            oWizard.previousStep();
            
            var oCurrentStep = oWizard.getCurrentStep();

            if (oCurrentStep === "__step0") 
            {
                oVisibilityModel.setProperty("/nextButtonVisible", true);
                oVisibilityModel.setProperty("/backButtonVisible", false);
                oVisibilityModel.setProperty("/sendButtonVisible", false);
            } 
            else if (oCurrentStep === "__step1") 
            {
                oVisibilityModel.setProperty("/nextButtonVisible", true);
                oVisibilityModel.setProperty("/backButtonVisible", true);
                oVisibilityModel.setProperty("/sendButtonVisible", false);
            } 
            else if (oCurrentStep === "__step2") 
            {
                oVisibilityModel.setProperty("/nextButtonVisible", false);
                oVisibilityModel.setProperty("/backButtonVisible", true);
                oVisibilityModel.setProperty("/sendButtonVisible", true);
            }
        },

        onFileUploadChange: function (oEvent) 
        {
            var oFileUploader = oEvent.getSource();
            var oFile = oFileUploader.oFileUpload.files[0];

            if (oFile) 
            {
                var oModel = this.getView().getModel();
                var reader = new FileReader();

                reader.onload = function (e) 
                {
                    var sBase64 = e.target.result.split(",")[1];

                    oModel.setProperty("/uploadedFile", 
                        {
                        name: oFile.name,
                        type: oFile.type,
                        content: sBase64
                    });
                };

                reader.readAsDataURL(oFile);
            }
        },

        handleTypeMissmatch: function(oEvent) 
        {
			var aFileTypes = oEvent.getSource().getFileType();
			aFileTypes.map(function(sType) {
				return "*." + sType;
			});

			MessageBox.error("Il tipo di file *." + oEvent.getParameter("fileType") +
								" non è supportato. Scegliere uno dei seguenti tipi: " +
								aFileTypes.join(", "));

            this.getView().getModel().setProperty("/uploadedFile", "");
		},

        onTokenUpdate: function(oEvent) 
        {
            var oModel = this.getView().getModel();
            var aCcEmails = oModel.getProperty("/ccEmails");
            var sType = oEvent.getParameter("type"); // 'added' or 'removed'

            if (sType === "added") 
            {
                var oAddedTokens = oEvent.getParameter("addedTokens");

                oAddedTokens.forEach(function(oToken) 
                {
                    var sNewEmail = oToken.getKey();

                    if (this._isValidEmail(sNewEmail)) 
                    {
                        aCcEmails.push({ email: sNewEmail });
                    } 
                    else 
                    {
                        MessageBox.error("Inserire un indirizzo email valido.");
                    }
                }.bind(this));
            } 
            else if (sType === "removed") 
            {
                var oRemovedTokens = oEvent.getParameter("removedTokens");

                oRemovedTokens.forEach(function(oToken) 
                {
                    var sEmailToDelete = oToken.getKey();

                    aCcEmails = aCcEmails.filter(function(item) 
                    {
                        return item.email !== sEmailToDelete;
                    });
                });
            }

            oModel.setProperty("/ccEmails", aCcEmails);
        },

        _isValidEmail: function(sEmail) {
            var oEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return oEmailRegex.test(sEmail);
        },

        onSendEmail: function() {
            var oModel = this.getView().getModel();
            var sSelectedClient = oModel.getProperty("/selectedClient");
            var sCode = oModel.getProperty("/code");
            var sEnvironment = oModel.getProperty("/environment");
            var sEmailTo = oModel.getProperty("/emailTo");
            var aCcEmails = oModel.getProperty("/ccEmails");
            var sEmailBody = oModel.getProperty("/emailBody");
            var oUploadedFile = oModel.getProperty("/uploadedFile");

            var sSubject = sSelectedClient + " " + sCode + " " + sEnvironment;
            var sBody = sEmailBody;

            if (!sEmailTo) {
                MessageBox.error("Inserire un indirizzo email valido.");
                return;
            }

            // Converti l'array di oggetti email in una stringa separata da virgole
            var sCcEmails = aCcEmails.map(function(item) {
                return item.email;
            }).join(";");

            // Preparazione dei dati per l'email
            var emailData = {
                to: sEmailTo,
                cc: sCcEmails,
                body: sBody,
                subject: sSubject
            };

            // Gestione dell'allegato se presente
            if (oUploadedFile) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var sFileContent = e.target.result;
                    
                    // Aggiungi l'allegato alla struttura dati dell'email
                    emailData.attachment = {
                        filename: oUploadedFile.name,
                        content: sFileContent
                    };
                    
                    // Invia l'email con allegato usando sap.m.URLHelper.triggerEmail()
                    sap.m.URLHelper.triggerEmail(
                        sEmailTo,
                        sSubject,
                        sBody,
                        sCcEmails,  // destinatari CC
                        null,       // destinatari BCC
                        emailData.attachment // allegati
                    );
                };
                reader.readAsDataURL(oUploadedFile);
            } else {
                // Invia email senza allegato
                sap.m.URLHelper.triggerEmail(
                    sEmailTo,
                    sSubject,
                    sBody,
                    sCcEmails,  // destinatari CC
                    null,       // destinatari BCC
                    null        // nessun allegato
                );
            }
        }
    });
});
