import {
    REST,
    Routes,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client,
    GatewayIntentBits,
} from "discord.js";
import { appendFileSync } from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const token = process.env.TOKEN;

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildIntegrations,
    ],
});

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);

const rest = new REST().setToken(token);
const commands = [
    {
        name: "place",
        description: "Place message",
        default_member_permissions: "0",
    },
];

// These numbers ain't private, don't worry.
rest.put(
    Routes.applicationGuildCommands(
        "1115336961159348285",
        "869951873749254225"
    ),
    { body: commands }
);
rest.put(
    Routes.applicationGuildCommands(
        "1115336961159348285",
        "957695442915835945"
    ),
    { body: commands }
);

client.on(Events.InteractionCreate, async (interaction) => {
    // console.log(interaction)

    if (interaction.customId === "survey") {
        let class1 = interaction.fields.getTextInputValue("class1");
        let class2 = interaction.fields.getTextInputValue("class2");
        let user =
            interaction.user.username + "#" + interaction.user.discriminator;

        const parse = (classId) => classId.replace(/\s/g, "").toUpperCase();

        class1 = parse(class1);
        class2 = parse(class2);

        appendFileSync("survey.csv", `${user},${class1},${class2}\n`);

        await interaction.reply({
            content: "Thank you for answering the survey!",
            ephemeral: true,
        });
    }

    if (interaction.customId === "primary") {
        const modal = new ModalBuilder()
            .setCustomId("survey")
            .setTitle("Elective Survey");

        const class1 = new TextInputBuilder()
            .setCustomId("class1")
            .setLabel("What elective are you taking? Format: CS138")
            .setStyle(TextInputStyle.Short);

        const class2 = new TextInputBuilder()
            .setCustomId("class2")
            .setLabel("What other elective? Or leave this blank.")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(class1);
        const secondActionRow = new ActionRowBuilder().addComponents(class2);
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    }

    if (interaction.commandName === "place") {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("primary")
                .setLabel("Answer Survey!")
                .setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({
            content:
                "Please click the button to participate in the 2A elective survey!",
            components: [row],
        });
    }
});
